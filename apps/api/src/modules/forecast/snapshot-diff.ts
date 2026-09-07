interface SnapshotItemValue {
  opportunityId: string;
  status: string;
  forecastCategory: string;
  estimatedAmount: number | { toNumber(): number };
  stageId: string;
  expectedCloseDate: Date;
  expectedBillingDate: Date | null;
}

const amount = (value: SnapshotItemValue['estimatedAmount']): number =>
  typeof value === 'number' ? value : value.toNumber();
const dateValue = (value: Date | null): string | null => value?.toISOString().slice(0, 10) ?? null;
const contributes = (item: SnapshotItemValue): boolean =>
  item.status === 'OPEN' && ['BEST_CASE', 'COMMIT'].includes(item.forecastCategory);

export function compareForecastSnapshots(
  current: SnapshotItemValue[],
  previous: SnapshotItemValue[],
) {
  const currentMap = new Map(current.map((item) => [item.opportunityId, item]));
  const previousMap = new Map(previous.map((item) => [item.opportunityId, item]));
  const added = current
    .filter((item) => !previousMap.has(item.opportunityId))
    .map((item) => ({ opportunityId: item.opportunityId, amount: amount(item.estimatedAmount) }));
  const removed = previous
    .filter((item) => !currentMap.has(item.opportunityId))
    .map((item) => ({ opportunityId: item.opportunityId, amount: amount(item.estimatedAmount) }));
  const amountChanges: Array<{ opportunityId: string; from: number; to: number; delta: number }> =
    [];
  const stageChanges: Array<{ opportunityId: string; from: string; to: string }> = [];
  const categoryChanges: Array<{ opportunityId: string; from: string; to: string }> = [];
  const expectedCloseChanges: Array<{
    opportunityId: string;
    from: string | null;
    to: string | null;
  }> = [];
  const billingDateChanges: Array<{
    opportunityId: string;
    from: string | null;
    to: string | null;
  }> = [];

  for (const item of current) {
    const before = previousMap.get(item.opportunityId);
    if (!before) continue;
    const fromAmount = amount(before.estimatedAmount);
    const toAmount = amount(item.estimatedAmount);
    if (fromAmount !== toAmount) {
      amountChanges.push({
        opportunityId: item.opportunityId,
        from: fromAmount,
        to: toAmount,
        delta: toAmount - fromAmount,
      });
    }
    if (before.stageId !== item.stageId) {
      stageChanges.push({
        opportunityId: item.opportunityId,
        from: before.stageId,
        to: item.stageId,
      });
    }
    if (before.forecastCategory !== item.forecastCategory) {
      categoryChanges.push({
        opportunityId: item.opportunityId,
        from: before.forecastCategory,
        to: item.forecastCategory,
      });
    }
    const beforeClose = dateValue(before.expectedCloseDate);
    const afterClose = dateValue(item.expectedCloseDate);
    if (beforeClose !== afterClose) {
      expectedCloseChanges.push({
        opportunityId: item.opportunityId,
        from: beforeClose,
        to: afterClose,
      });
    }
    const beforeBilling = dateValue(before.expectedBillingDate);
    const afterBilling = dateValue(item.expectedBillingDate);
    if (beforeBilling !== afterBilling) {
      billingDateChanges.push({
        opportunityId: item.opportunityId,
        from: beforeBilling,
        to: afterBilling,
      });
    }
  }

  const forecastTotal = (items: SnapshotItemValue[]): number =>
    items.filter(contributes).reduce((total, item) => total + amount(item.estimatedAmount), 0);
  const previousForecast = forecastTotal(previous);
  const currentForecast = forecastTotal(current);
  return {
    added,
    removed,
    amountChanges,
    stageChanges,
    categoryChanges,
    expectedCloseChanges,
    billingDateChanges,
    previousForecast,
    currentForecast,
    totalForecastDelta: currentForecast - previousForecast,
  };
}
