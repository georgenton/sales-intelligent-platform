export const PIPELINE_STAGES = new Set(['20', '40']);
export const FORECAST_STAGES = new Set(['60', '80']);
export const BACKLOG_STAGE = '90';

export interface ManagerOpportunityMetric {
  id: string;
  amount: number;
  grossProfit: number | null;
  stageCode: string;
  status: 'OPEN' | 'WON' | 'LOST' | 'CANCELLED';
  expectedBillingDate: Date | null;
  lastStageChangedAt: Date | null;
}

export interface PipelineSnapshotMetric {
  opportunityId: string;
  amount: number;
  stageCode: string;
  status: 'OPEN' | 'WON' | 'LOST' | 'CANCELLED';
}

export function managerCommercialBuckets(rows: ManagerOpportunityMetric[]): {
  pipeline: number;
  forecast: number;
  backlog: number;
  forecastAndBacklog: number;
} {
  let pipeline = 0;
  let forecast = 0;
  let backlog = 0;
  for (const row of rows) {
    if (row.status === 'OPEN' && PIPELINE_STAGES.has(row.stageCode)) pipeline += row.amount;
    if (row.status === 'OPEN' && FORECAST_STAGES.has(row.stageCode)) forecast += row.amount;
    if (row.status === 'WON' && row.stageCode === BACKLOG_STAGE) backlog += row.amount;
  }
  return { pipeline, forecast, backlog, forecastAndBacklog: forecast + backlog };
}

export function weightedGrossMargin(rows: Array<{ amount: number; grossProfit: number | null }>): {
  amount: number;
  percent: number | null;
  knownRevenue: number;
} {
  let grossProfit = 0;
  let knownRevenue = 0;
  for (const row of rows) {
    if (row.grossProfit === null) continue;
    grossProfit += row.grossProfit;
    knownRevenue += row.amount;
  }
  return {
    amount: grossProfit,
    percent: knownRevenue > 0 ? (grossProfit / knownRevenue) * 100 : null,
    knownRevenue,
  };
}

export function fourToOneCoverage(input: {
  baseAmount: number | null;
  availablePipeline: number;
  ratio?: number;
}): {
  status: 'NOT_EVALUABLE' | 'SUFFICIENT' | 'INSUFFICIENT';
  baseAmount: number | null;
  requiredPipeline: number | null;
  availablePipeline: number;
  difference: number | null;
  ratio: number;
} {
  const ratio = input.ratio ?? 4;
  if (input.baseAmount === null || input.baseAmount < 0 || ratio <= 0) {
    return {
      status: 'NOT_EVALUABLE',
      baseAmount: input.baseAmount,
      requiredPipeline: null,
      availablePipeline: input.availablePipeline,
      difference: null,
      ratio,
    };
  }
  const requiredPipeline = input.baseAmount * ratio;
  const difference = input.availablePipeline - requiredPipeline;
  return {
    status: difference >= 0 ? 'SUFFICIENT' : 'INSUFFICIENT',
    baseAmount: input.baseAmount,
    requiredPipeline,
    availablePipeline: input.availablePipeline,
    difference,
    ratio,
  };
}

export function compareWeeklyPipeline(
  current: PipelineSnapshotMetric[] | null,
  previous: PipelineSnapshotMetric[] | null,
): {
  status: 'NO_COMPARISON' | 'AVAILABLE';
  previous: number | null;
  current: number | null;
  changeAmount: number | null;
  changePercent: number | null;
  droppedMoreThanTenPercent: boolean;
  movements: Array<{
    opportunityId: string;
    kind:
      | 'ENTERED_PIPELINE'
      | 'LEFT_PIPELINE'
      | 'ADVANCED_TO_FORECAST'
      | 'LOST_OR_CANCELLED'
      | 'AMOUNT_CHANGED';
    delta: number;
  }>;
} {
  if (!current || !previous) {
    return {
      status: 'NO_COMPARISON',
      previous: null,
      current: null,
      changeAmount: null,
      changePercent: null,
      droppedMoreThanTenPercent: false,
      movements: [],
    };
  }
  const currentMap = new Map(current.map((item) => [item.opportunityId, item]));
  const previousMap = new Map(previous.map((item) => [item.opportunityId, item]));
  const pipelineAmount = (items: PipelineSnapshotMetric[]) =>
    items.reduce(
      (total, item) =>
        total + (item.status === 'OPEN' && PIPELINE_STAGES.has(item.stageCode) ? item.amount : 0),
      0,
    );
  const previousTotal = pipelineAmount(previous);
  const currentTotal = pipelineAmount(current);
  const movements: ReturnType<typeof compareWeeklyPipeline>['movements'] = [];
  for (const opportunityId of new Set([...previousMap.keys(), ...currentMap.keys()])) {
    const before = previousMap.get(opportunityId);
    const after = currentMap.get(opportunityId);
    const wasPipeline = Boolean(
      before && before.status === 'OPEN' && PIPELINE_STAGES.has(before.stageCode),
    );
    const isPipeline = Boolean(
      after && after.status === 'OPEN' && PIPELINE_STAGES.has(after.stageCode),
    );
    if (!wasPipeline && isPipeline && after) {
      movements.push({ opportunityId, kind: 'ENTERED_PIPELINE', delta: after.amount });
    } else if (wasPipeline && !isPipeline && before) {
      const kind =
        after && FORECAST_STAGES.has(after.stageCode)
          ? 'ADVANCED_TO_FORECAST'
          : after && ['LOST', 'CANCELLED'].includes(after.status)
            ? 'LOST_OR_CANCELLED'
            : 'LEFT_PIPELINE';
      movements.push({ opportunityId, kind, delta: -before.amount });
    } else if (wasPipeline && isPipeline && before && after && before.amount !== after.amount) {
      movements.push({
        opportunityId,
        kind: 'AMOUNT_CHANGED',
        delta: after.amount - before.amount,
      });
    }
  }
  const changeAmount = currentTotal - previousTotal;
  const changePercent = previousTotal > 0 ? (changeAmount / previousTotal) * 100 : null;
  return {
    status: 'AVAILABLE',
    previous: previousTotal,
    current: currentTotal,
    changeAmount,
    changePercent,
    droppedMoreThanTenPercent: changePercent !== null && changePercent < -10,
    movements,
  };
}

export function outstandingBacklogAmount(input: {
  opportunityAmount: number;
  billedAmount: number;
}): number {
  return Math.max(0, input.opportunityAmount - input.billedAmount);
}

export function distinctCustomersVisited(visits: Array<{ customerId: string }>): number {
  return new Set(visits.map((visit) => visit.customerId)).size;
}

export function isClosedWeek(weekEnd: Date, now: Date): boolean {
  return weekEnd.getTime() < now.getTime();
}

export function stalledOpportunity(input: {
  status: ManagerOpportunityMetric['status'];
  stageCode: string;
  lastStageChangedAt: Date | null;
  thresholdDays: number;
  now: Date;
}): { evaluable: boolean; stalled: boolean; daysWithoutProgress: number | null } {
  if (
    input.status !== 'OPEN' ||
    input.stageCode === '100' ||
    !input.lastStageChangedAt ||
    input.thresholdDays <= 0
  ) {
    return {
      evaluable: Boolean(input.lastStageChangedAt),
      stalled: false,
      daysWithoutProgress: null,
    };
  }
  const daysWithoutProgress = Math.max(
    0,
    Math.floor((input.now.getTime() - input.lastStageChangedAt.getTime()) / 86_400_000),
  );
  return {
    evaluable: true,
    stalled: daysWithoutProgress > input.thresholdDays,
    daysWithoutProgress,
  };
}
