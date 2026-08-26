window.SIP = {
  tenant: 'Tech Distribution Demo',
  period: 'FY26 Q3',
  periods: ['FY26 Q1', 'FY26 Q2', 'FY26 Q3', 'FY26 Q4'],
  users: {
    seller: { name: 'Sofía Torres', role: 'SELLER', roleLabel: 'Seller' },
    manager: { name: 'Morgan Silva', role: 'MANAGER', roleLabel: 'Sales manager' },
    admin: { name: 'Alex Rivera', role: 'TENANT_ADMIN', roleLabel: 'Tenant admin' },
  },
  sellerKpis: { quota: 480000, billed: 214000, forecast: 168000, gap: 98000, coverage: 2.1 },
  teamKpis: { quota: 2200000, billed: 1180000, forecast: 630000, pipeline: 3560000, commit: 610000, backlog: 340000, gap: 390000, coverage: 1.9, atRisk: 7, margin: 11.4 },
  funnel: [
    { name: 'Discovery', token: 'discovery', amount: 1240000, count: 18, probability: 25, avgAmount: 68900, avgDaysInStage: 22, atRisk: 4, likelyToSlip: 240000 },
    { name: 'Proposal', token: 'proposal', amount: 860000, count: 11, probability: 50, avgAmount: 78200, avgDaysInStage: 17, atRisk: 2, likelyToSlip: 120000 },
    { name: 'Commit', token: 'commit', amount: 610000, count: 7, probability: 75, avgAmount: 87100, avgDaysInStage: 31, atRisk: 3, likelyToSlip: 180000 },
    { name: 'Closed won', token: 'backlog', amount: 340000, count: 5, probability: 90, avgAmount: 68000, avgDaysInStage: 12, atRisk: 1 },
    { name: 'Billed', token: 'billed', amount: 1180000, count: 14, probability: 100, avgAmount: 84300, avgDaysInStage: 0 },
  ],
  brands: [['HP', 940000], ['Lenovo', 810000], ['Nutanix', 690000], ['Dell', 620000], ['Hitachi', 500000]],
  sellers: [
    { seller: 'Sofía Torres', opportunities: 14, pipeline: 820000, commit: 310000, quota: 480000 },
    { seller: 'Diego Andrade', opportunities: 11, pipeline: 640000, commit: 98000, quota: 480000 },
    { seller: 'Camila Paz', opportunities: 9, pipeline: 520000, commit: 245000, quota: 480000 },
    { seller: 'Andrés Coba', opportunities: 12, pipeline: 730000, commit: 180000, quota: 400000 },
  ],
  opportunities: [
    { id: 'o1', title: 'Lenovo core modernization', customer: 'Banco ABC', amount: 180000, stage: 'Commit', stageCode: '75', forecastCategory: 'Commit', status: 'OPEN', seller: 'Sofía Torres', partner: 'Andes Technology', brand: 'Lenovo', closeDate: '30 Sep 2026', billingDate: '14 Oct 2026', margin: 8.4, daysInStage: 41, stageBenchmarkDays: 21, nextAction: 'Call the CFO to confirm the purchase order before Friday.', health: { score: 42, status: 'CRITICAL', factors: [{ code: 'STAGE_STAGNATION', impact: -18, message: '41 days in Commit, benchmark 21' }, { code: 'LOW_MARGIN', impact: -12, message: 'Margin 8.4% is below the 10% threshold' }, { code: 'NO_ACTIVITY', impact: -14, message: 'No activity logged in 9 days' }] }, alerts: [{ code: 'MISSING_PO', severity: 'CRITICAL' }, { code: 'LOW_MARGIN', severity: 'WARNING' }], confidence: 38, stageHistory: [{ from: 'Proposal', to: 'Commit', by: 'Sofía Torres', at: '12 Jul 2026' }, { from: 'Discovery', to: 'Proposal', by: 'Sofía Torres', at: '2 Jun 2026' }], risk: 'No activity in 9 days and no purchase order at 75%.', suggestion: 'Contact customer.' },
    { id: 'o2', title: 'Nutanix data platform', customer: 'Retail Norte', amount: 210000, stage: 'Closed won · pending billing', stageCode: '90', forecastCategory: 'Commit', status: 'WON', seller: 'Sofía Torres', partner: 'CloudBridge', brand: 'Nutanix', closeDate: '18 Sep 2026', billingDate: null, margin: 14.2, daysInStage: 9, stageBenchmarkDays: 14, nextAction: 'Request the purchase order from procurement.', health: { score: 66, status: 'AT_RISK', factors: [{ code: 'MISSING_PO', impact: -22, message: 'No purchase order at 90%' }] }, alerts: [{ code: 'MISSING_PO', severity: 'CRITICAL' }], confidence: 61, stageHistory: [{ from: 'Commit', to: 'Closed won · pending billing', by: 'Sofía Torres', at: '18 Aug 2026' }], risk: 'No purchase order recorded at 90%.', suggestion: 'Request PO from procurement.' },
    { id: 'o3', title: 'HP workplace refresh', customer: 'Ministerio de Salud', amount: 96000, stage: 'Proposal', stageCode: '50', forecastCategory: 'Best case', status: 'OPEN', seller: 'Diego Andrade', partner: 'Digital Core', brand: 'HP', closeDate: '12 Oct 2026', billingDate: null, margin: 12.8, daysInStage: 14, stageBenchmarkDays: 18, nextAction: 'Schedule the technical validation workshop.', health: { score: 78, status: 'HEALTHY', factors: [{ code: 'ON_PACE', impact: 6, message: 'Moving faster than the stage benchmark' }] }, alerts: [], confidence: 72, stageHistory: [{ from: 'Discovery', to: 'Proposal', by: 'Diego Andrade', at: '11 Aug 2026' }], risk: 'Public tender timeline may extend past the quarter.', suggestion: 'Confirm the award date.' },
    { id: 'o4', title: 'Hitachi storage renewal', customer: 'Telco Andina', amount: 142000, stage: 'Discovery', stageCode: '25', forecastCategory: 'Pipeline', status: 'OPEN', seller: 'Camila Paz', partner: 'Pacific IT', brand: 'Hitachi', closeDate: '28 Nov 2026', billingDate: null, margin: 9.1, daysInStage: 33, stageBenchmarkDays: 22, nextAction: 'Qualify the budget owner.', health: { score: 54, status: 'AT_RISK', factors: [{ code: 'STAGE_STAGNATION', impact: -15, message: '33 days in Discovery' }] }, alerts: [{ code: 'STAGE_STAGNATION', severity: 'WARNING' }, { code: 'LOW_MARGIN', severity: 'WARNING' }], confidence: 44, stageHistory: [{ from: null, to: 'Discovery', by: 'Camila Paz', at: '24 Jul 2026' }], risk: 'Stuck in Discovery for 33 days.', suggestion: 'Qualify the budget owner.' },
    { id: 'o5', title: 'Dell branch rollout', customer: 'Cooperativa Sur', amount: 88000, stage: 'Billed', stageCode: '100', forecastCategory: 'Closed', status: 'WON', seller: 'Andrés Coba', partner: 'Nova Systems', brand: 'Dell', closeDate: '4 Aug 2026', billingDate: '19 Aug 2026', margin: 15.6, daysInStage: 0, stageBenchmarkDays: 0, nextAction: 'None — invoiced.', health: { score: 92, status: 'HEALTHY', factors: [] }, alerts: [], confidence: 98, stageHistory: [{ from: 'Closed won · pending billing', to: 'Billed', by: 'Alex Rivera', at: '19 Aug 2026' }], risk: null, suggestion: null },
  ],
  movements: [
    { label: 'Banco ABC · Lenovo core modernization', delta: -180000, reason: 'Close date moved out of the quarter', opportunityId: 'o1' },
    { label: 'Retail Norte · Nutanix data platform', delta: -95000, reason: 'Commit → Best case, purchase order missing', opportunityId: 'o2' },
    { label: 'Ministerio de Salud · HP workplace refresh', delta: 65000, reason: 'Stage 25 → 50', opportunityId: 'o3' },
    { label: 'Telco Andina · Hitachi storage renewal', delta: -32000, reason: 'Amount revised after scoping', opportunityId: 'o4' },
  ],
  alerts: [
    { code: 'MISSING_PO', severity: 'CRITICAL', title: 'Banco ABC · Lenovo core modernization', message: 'Purchase order is required at this stage', at: '25 Aug 2026, 08:12' },
    { code: 'LOW_MARGIN', severity: 'WARNING', title: 'Telco Andina · Hitachi storage renewal', message: 'Margin is below the 10% tenant threshold', at: '24 Aug 2026, 17:40' },
    { code: 'STAGE_STAGNATION', severity: 'WARNING', title: 'Telco Andina · Hitachi storage renewal', message: 'Opportunity has remained more than 30 days in stage', at: '24 Aug 2026, 06:02' },
  ],
};
