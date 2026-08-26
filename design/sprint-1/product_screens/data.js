// Sales Intelligence Platform — synthetic but realistic demo dataset.
// Fictional customers and partners. Brands are real vendor names as used in the product seed.
window.SIP2 = (() => {
  const STAGES = [
    { code: 0, name: 'Initial', token: 'discovery' },
    { code: 25, name: 'Qualified', token: 'qualified' },
    { code: 50, name: 'Proposal', token: 'proposal' },
    { code: 75, name: 'Commit', token: 'commit' },
    { code: 90, name: 'Backlog', token: 'backlog' },
    { code: 100, name: 'Billed', token: 'billed' },
  ];
  const stage = (code) => STAGES.find((s) => s.code === code);

  const o = (x) => ({ status: 'OPEN', currency: 'USD', ...x, stage: stage(x.stageCode) });

  const opportunities = [
    o({
      id: 'OPP-2041', title: 'Core banking infrastructure renewal', customer: 'Banco Andino',
      seller: 'Sofía Torres', brand: 'Lenovo', partner: 'Andes Technology', amount: 240000,
      stageCode: 75, forecastCategory: 'COMMIT', suggestedCategory: 'UPSIDE', confidence: 62,
      closeDate: '19 Dec 2026', billingDate: '15 Jan 2027', margin: 9.2, daysInStage: 38, benchmarkDays: 21,
      health: { score: 48, status: 'AT_RISK', factors: [
        { code: 'CLOSE_DATE_MOVED', impact: -16, message: 'Closing date moved twice (Nov 14 → Dec 5 → Dec 19)' },
        { code: 'MISSING_PO', impact: -14, message: 'No purchase order at 75%' },
        { code: 'STAGE_STAGNATION', impact: -10, message: '38 days in Commit, benchmark 21' },
        { code: 'BUYER_IDENTIFIED', impact: 8, message: 'Economic buyer identified and engaged' } ] },
      alerts: [{ code: 'MISSING_PO', severity: 'CRITICAL' }, { code: 'LOW_MARGIN', severity: 'WARNING' }],
      evidence: ['Proposal accepted by IT and Finance', 'Economic buyer identified (CFO)', 'Technical validation complete'],
      risks: ['Closing date moved twice', 'Purchase order missing', 'Margin 9.2% below the 10% threshold'],
      missing: ['Purchase order number', 'Signed billing schedule'],
      nextAction: 'Call the CFO to confirm the purchase order before Friday.',
      lastActivity: '9 days ago · discovery call',
      stageHistory: [
        { from: 'Proposal', to: 'Commit', by: 'Sofía Torres', at: '12 Nov 2026' },
        { from: 'Qualified', to: 'Proposal', by: 'Sofía Torres', at: '28 Sep 2026' },
        { from: 'Initial', to: 'Qualified', by: 'Sofía Torres', at: '3 Sep 2026' } ],
    }),
    o({
      id: 'OPP-2088', title: 'Hyperconverged data platform', customer: 'Grupo Pacífico',
      seller: 'Camila Paz', brand: 'Nutanix', partner: 'CloudBridge', amount: 310000,
      stageCode: 75, forecastCategory: 'COMMIT', suggestedCategory: 'COMMIT', confidence: 84,
      closeDate: '12 Dec 2026', billingDate: '20 Dec 2026', margin: 15.4, daysInStage: 12, benchmarkDays: 21,
      health: { score: 86, status: 'HEALTHY', factors: [
        { code: 'PO_RECEIVED', impact: 12, message: 'Purchase order received (PO-88412)' },
        { code: 'ON_PACE', impact: 6, message: 'Moving faster than the stage benchmark' } ] },
      alerts: [],
      evidence: ['Purchase order received', 'Proof of concept signed off', 'Budget confirmed for FY27'],
      risks: [], missing: [],
      nextAction: 'Confirm the delivery window with logistics.',
      lastActivity: '2 days ago · commercial review',
      stageHistory: [ { from: 'Proposal', to: 'Commit', by: 'Camila Paz', at: '8 Dec 2026' }, { from: 'Qualified', to: 'Proposal', by: 'Camila Paz', at: '14 Oct 2026' } ],
    }),
    o({
      id: 'OPP-2103', title: 'Policy platform storage refresh', customer: 'Seguros Continental',
      seller: 'Diego Andrade', brand: 'Hitachi', partner: 'Pacific IT', amount: 186000,
      stageCode: 75, forecastCategory: 'COMMIT', suggestedCategory: 'BEST_CASE', confidence: 41,
      closeDate: '22 Dec 2026', billingDate: null, margin: 7.4, daysInStage: 44, benchmarkDays: 21,
      health: { score: 36, status: 'CRITICAL', factors: [
        { code: 'NO_ACTIVITY', impact: -18, message: 'No activity logged in 16 days' },
        { code: 'LOW_MARGIN', impact: -12, message: 'Margin 7.4% below the 10% threshold' },
        { code: 'STAGE_STAGNATION', impact: -14, message: '44 days in Commit, benchmark 21' } ] },
      alerts: [{ code: 'STAGE_STAGNATION', severity: 'HIGH' }, { code: 'LOW_MARGIN', severity: 'WARNING' }, { code: 'NO_ACTIVITY', severity: 'CRITICAL' }],
      evidence: ['Technical requirements documented'],
      risks: ['No activity in 16 days', 'No economic buyer identified', 'Competitor evaluation in progress'],
      missing: ['Economic buyer', 'Next step date', 'Purchase order number'],
      nextAction: 'Re-qualify: confirm whether the budget still exists for this quarter.',
      lastActivity: '16 days ago · email',
      stageHistory: [ { from: 'Proposal', to: 'Commit', by: 'Diego Andrade', at: '6 Nov 2026' } ],
    }),
    o({
      id: 'OPP-2117', title: 'Campus workplace modernization', customer: 'Universidad Metropolitana',
      seller: 'Sofía Torres', brand: 'HP', partner: 'Digital Core', amount: 148000,
      stageCode: 50, forecastCategory: 'BEST_CASE', suggestedCategory: 'BEST_CASE', confidence: 71,
      closeDate: '28 Jan 2027', billingDate: null, margin: 13.1, daysInStage: 16, benchmarkDays: 24,
      health: { score: 74, status: 'HEALTHY', factors: [{ code: 'ON_PACE', impact: 5, message: 'On pace against the stage benchmark' }] },
      alerts: [],
      evidence: ['Public tender requirements confirmed', 'Reference visit completed'],
      risks: ['Public tender award date may slip past the quarter'],
      missing: ['Award date confirmation'],
      nextAction: 'Confirm the tender award date with procurement.',
      lastActivity: '3 days ago · workshop',
      stageHistory: [ { from: 'Qualified', to: 'Proposal', by: 'Sofía Torres', at: '24 Nov 2026' } ],
    }),
    o({
      id: 'OPP-2124', title: 'Store network refresh — 140 branches', customer: 'RetailNova',
      seller: 'Andrés Coba', brand: 'Dell', partner: 'Nova Systems', amount: 275000,
      stageCode: 50, forecastCategory: 'BEST_CASE', suggestedCategory: 'COMMIT', confidence: 78,
      closeDate: '18 Dec 2026', billingDate: null, margin: 11.9, daysInStage: 9, benchmarkDays: 24,
      health: { score: 79, status: 'HEALTHY', factors: [{ code: 'MULTI_STAKEHOLDER', impact: 7, message: 'Operations and IT both sponsoring' }] },
      alerts: [],
      evidence: ['Pilot approved in 12 stores', 'Rollout plan agreed with operations'],
      risks: ['Rollout depends on store closures in January'],
      missing: ['Signed rollout calendar'],
      nextAction: 'Agree the January rollout calendar with store operations.',
      lastActivity: 'Yesterday · rollout planning',
      stageHistory: [ { from: 'Qualified', to: 'Proposal', by: 'Andrés Coba', at: '1 Dec 2026' } ],
    }),
    o({
      id: 'OPP-2131', title: 'Disaster recovery site build', customer: 'Cooperativa Andes',
      seller: 'Valeria Núñez', brand: 'Nutanix', partner: 'CloudBridge', amount: 198000,
      stageCode: 25, forecastCategory: 'PIPELINE', suggestedCategory: 'PIPELINE', confidence: 34,
      closeDate: '26 Feb 2027', billingDate: null, margin: 12.6, daysInStage: 41, benchmarkDays: 18,
      health: { score: 52, status: 'AT_RISK', factors: [{ code: 'STAGE_STAGNATION', impact: -15, message: '41 days in Qualified, benchmark 18' }] },
      alerts: [{ code: 'STAGE_STAGNATION', severity: 'WARNING' }],
      evidence: ['Regulatory driver confirmed'],
      risks: ['Stalled 41 days in Qualified', 'No budget owner identified'],
      missing: ['Budget owner', 'Technical scope'],
      nextAction: 'Identify the budget owner and book a scoping session.',
      lastActivity: '11 days ago · call',
      stageHistory: [ { from: 'Initial', to: 'Qualified', by: 'Valeria Núñez', at: '29 Oct 2026' } ],
    }),
    o({
      id: 'OPP-2140', title: 'Clinical imaging storage expansion', customer: 'Hospital San Lucas',
      seller: 'Camila Paz', brand: 'Hitachi', partner: 'Pacific IT', amount: 132000,
      stageCode: 90, forecastCategory: 'COMMIT', suggestedCategory: 'COMMIT', confidence: 92,
      closeDate: '2 Dec 2026', billingDate: '18 Dec 2026', margin: 16.2, daysInStage: 6, benchmarkDays: 12,
      health: { score: 91, status: 'HEALTHY', factors: [{ code: 'PO_RECEIVED', impact: 14, message: 'Purchase order received (PO-77201)' }] },
      alerts: [], evidence: ['Purchase order received', 'Delivery scheduled'], risks: [], missing: [],
      nextAction: 'Confirm invoicing with finance for the December close.',
      lastActivity: '4 days ago · delivery planning',
      stageHistory: [ { from: 'Commit', to: 'Backlog', by: 'Camila Paz', at: '28 Nov 2026' } ],
    }),
    o({
      id: 'OPP-2146', title: 'Textile ERP server consolidation', customer: 'Textiles Ribera',
      seller: 'Diego Andrade', brand: 'Lenovo', partner: 'Andes Technology', amount: 94000,
      stageCode: 25, forecastCategory: 'PIPELINE', suggestedCategory: 'PIPELINE', confidence: 38,
      closeDate: '14 Mar 2027', billingDate: null, margin: 8.8, daysInStage: 27, benchmarkDays: 18,
      health: { score: 58, status: 'AT_RISK', factors: [{ code: 'LOW_MARGIN', impact: -9, message: 'Margin 8.8% below threshold' }] },
      alerts: [{ code: 'LOW_MARGIN', severity: 'WARNING' }],
      evidence: ['Current hardware end of support in Q2'],
      risks: ['Margin below threshold', 'No next step scheduled'],
      missing: ['Next step date', 'Decision criteria'],
      nextAction: 'Book the technical assessment and rebuild the margin case.',
      lastActivity: '8 days ago · email',
      stageHistory: [ { from: 'Initial', to: 'Qualified', by: 'Diego Andrade', at: '12 Nov 2026' } ],
    }),
    o({
      id: 'OPP-2151', title: 'Branch endpoint fleet renewal', customer: 'Banco Andino',
      seller: 'Valeria Núñez', brand: 'HP', partner: 'Digital Core', amount: 122000,
      stageCode: 100, status: 'WON', forecastCategory: 'CLOSED', suggestedCategory: 'CLOSED', confidence: 100,
      closeDate: '7 Nov 2026', billingDate: '21 Nov 2026', margin: 14.8, daysInStage: 0, benchmarkDays: 0,
      health: { score: 96, status: 'HEALTHY', factors: [] }, alerts: [], evidence: ['Invoiced INV-4471'], risks: [], missing: [],
      nextAction: 'None — invoiced.', lastActivity: '21 Nov 2026 · invoiced',
      stageHistory: [ { from: 'Backlog', to: 'Billed', by: 'Alex Rivera', at: '21 Nov 2026' } ],
    }),
    o({
      id: 'OPP-2158', title: 'Contact centre virtualization', customer: 'Seguros Continental',
      seller: 'Andrés Coba', brand: 'Dell', partner: 'Nova Systems', amount: 164000,
      stageCode: 75, forecastCategory: 'COMMIT', suggestedCategory: 'UPSIDE', confidence: 57,
      closeDate: '30 Dec 2026', billingDate: null, margin: 10.4, daysInStage: 25, benchmarkDays: 21,
      health: { score: 61, status: 'AT_RISK', factors: [
        { code: 'CLOSE_DATE_MOVED', impact: -12, message: 'Closing date moved once (Dec 12 → Dec 30)' },
        { code: 'MISSING_PO', impact: -10, message: 'No purchase order at 75%' } ] },
      alerts: [{ code: 'MISSING_PO', severity: 'HIGH' }],
      evidence: ['Proposal accepted', 'Security review passed'],
      risks: ['Closing date moved once', 'Purchase order missing', 'Year-end freeze on new spend'],
      missing: ['Purchase order number'],
      nextAction: 'Ask procurement whether the PO can be issued before the freeze.',
      lastActivity: '5 days ago · procurement call',
      stageHistory: [ { from: 'Proposal', to: 'Commit', by: 'Andrés Coba', at: '13 Nov 2026' } ],
    }),
    o({
      id: 'OPP-2163', title: 'Analytics platform expansion', customer: 'Grupo Pacífico',
      seller: 'Sofía Torres', brand: 'Nutanix', partner: 'CloudBridge', amount: 208000,
      stageCode: 50, forecastCategory: 'BEST_CASE', suggestedCategory: 'BEST_CASE', confidence: 66,
      closeDate: '5 Feb 2027', billingDate: null, margin: 13.8, daysInStage: 21, benchmarkDays: 24,
      health: { score: 72, status: 'HEALTHY', factors: [] }, alerts: [],
      evidence: ['Business case approved by the data office'],
      risks: ['Competing internal project for the same budget'],
      missing: ['Budget confirmation for FY27'],
      nextAction: 'Confirm FY27 budget allocation with the data office.',
      lastActivity: '6 days ago · business review',
      stageHistory: [ { from: 'Qualified', to: 'Proposal', by: 'Sofía Torres', at: '19 Nov 2026' } ],
    }),
    o({
      id: 'OPP-2170', title: 'Campus network segmentation', customer: 'Universidad Metropolitana',
      seller: 'Diego Andrade', brand: 'HP', partner: 'Digital Core', amount: 88000,
      stageCode: 0, forecastCategory: 'PIPELINE', suggestedCategory: 'PIPELINE', confidence: 22,
      closeDate: '30 Mar 2027', billingDate: null, margin: 11.2, daysInStage: 14, benchmarkDays: 15,
      health: { score: 64, status: 'AT_RISK', factors: [] }, alerts: [],
      evidence: [], risks: ['Not yet qualified'], missing: ['Requirements', 'Budget', 'Timeline'],
      nextAction: 'Run the discovery workshop scheduled for next week.',
      lastActivity: '2 days ago · intro meeting',
      stageHistory: [ { from: null, to: 'Initial', by: 'Diego Andrade', at: '25 Nov 2026' } ],
    }),
    o({
      id: 'OPP-2176', title: 'Warehouse compute refresh', customer: 'RetailNova',
      seller: 'Camila Paz', brand: 'Lenovo', partner: 'Andes Technology', amount: 156000,
      stageCode: 90, forecastCategory: 'COMMIT', suggestedCategory: 'COMMIT', confidence: 88,
      closeDate: '9 Dec 2026', billingDate: '23 Dec 2026', margin: 12.9, daysInStage: 8, benchmarkDays: 12,
      health: { score: 88, status: 'HEALTHY', factors: [{ code: 'PO_RECEIVED', impact: 13, message: 'Purchase order received (PO-90233)' }] },
      alerts: [], evidence: ['Purchase order received'], risks: [], missing: [],
      nextAction: 'Track delivery for the December billing window.',
      lastActivity: '3 days ago · logistics',
      stageHistory: [ { from: 'Commit', to: 'Backlog', by: 'Camila Paz', at: '1 Dec 2026' } ],
    }),
    o({
      id: 'OPP-2182', title: 'Treasury platform HA upgrade', customer: 'Cooperativa Andes',
      seller: 'Valeria Núñez', brand: 'Dell', partner: 'Pacific IT', amount: 142000,
      stageCode: 75, forecastCategory: 'COMMIT', suggestedCategory: 'COMMIT', confidence: 74,
      closeDate: '17 Dec 2026', billingDate: '8 Jan 2027', margin: 11.1, daysInStage: 15, benchmarkDays: 21,
      health: { score: 76, status: 'HEALTHY', factors: [] }, alerts: [],
      evidence: ['Proposal accepted', 'Economic buyer identified'],
      risks: ['Billing date falls into the next quarter'],
      missing: ['Purchase order number'],
      nextAction: 'Request the purchase order to protect December billing.',
      lastActivity: '4 days ago · commercial call',
      stageHistory: [ { from: 'Proposal', to: 'Commit', by: 'Valeria Núñez', at: '23 Nov 2026' } ],
    }),
  ];

  const byId = (id) => opportunities.find((x) => x.id === id);

  return {
    tenant: 'Andes Technology Distribution',
    period: 'FY26 Q4',
    periodRange: '1 Dec 2026 – 28 Feb 2027',
    week: 'Week 8',
    periods: ['FY26 Q1', 'FY26 Q2', 'FY26 Q3', 'FY26 Q4'],
    currency: 'USD',
    STAGES, stage, byId, opportunities,

    users: {
      seller: { name: 'Sofía Torres', role: 'Seller', team: 'Enterprise · Andean region', email: 'sofia@andestech.demo' },
      manager: { name: 'Morgan Silva', role: 'Sales manager', team: 'Enterprise · 5 sellers', email: 'morgan@andestech.demo' },
    },

    seller: {
      quota: 1100000, billed: 620000, forecast: 940000, commit: 550000, backlog: 132000,
      gap: 160000, likelyAttainment: 85.5, coverage: 2.6, pipeline: 1580000, margin: 12.4, atRisk: 3,
      deltaSinceReview: -64000, confidence: 71,
    },

    team: {
      quota: 4800000, billed: 2140000, forecast: 3740000, commit: 980000, backlog: 620000,
      pipeline: 8900000, coverage: 2.4, gap: 1060000, likelyAttainment: 77.9, margin: 11.4,
      atRisk: 18, forecastAccuracy: 81, slippage: 640000,
      deltaSinceReview: -183000, lastReview: 'Week 7 review · 18 Dec',
      confidence: 64, confidenceBand: { low: 3180000, high: 4020000 },
    },

    insight: {
      headline: 'Forecast is $1.06M below quota with 7 weeks left.',
      body: 'Three Commit opportunities worth $590K carry open risk signals — two are missing purchase orders and one has had no activity in 16 days. Diego Andrade accounts for $186K of that and is at 41.4% likely attainment.',
      actions: ['Review the 3 risks', 'Open forecast review'],
    },

    funnel: [
      { name: 'Initial', token: 'discovery', amount: 2980000, count: 34, atRiskAmount: 520000, probability: 0, avgAmount: 87600, avgDaysInStage: 19, atRisk: 6, conversion: 41, likelyToSlip: 980000 },
      { name: 'Qualified', token: 'qualified', amount: 2240000, count: 26, atRiskAmount: 430000, probability: 25, avgAmount: 86100, avgDaysInStage: 23, atRisk: 5, conversion: 54, likelyToSlip: 620000 },
      { name: 'Proposal', token: 'proposal', amount: 1680000, count: 19, atRiskAmount: 355000, probability: 50, avgAmount: 88400, avgDaysInStage: 26, atRisk: 4, conversion: 62, likelyToSlip: 410000 },
      { name: 'Commit', token: 'commit', amount: 980000, count: 22, atRiskAmount: 590000, probability: 75, avgAmount: 44500, avgDaysInStage: 24, atRisk: 3, conversion: 81, likelyToSlip: 590000 },
      { name: 'Backlog', token: 'backlog', amount: 620000, count: 9, atRiskAmount: 132000, probability: 90, avgAmount: 68900, avgDaysInStage: 11, atRisk: 1, conversion: 96, likelyToSlip: 130000 },
      { name: 'Billed', token: 'billed', amount: 2140000, count: 27, atRiskAmount: 0, probability: 100, avgAmount: 79300, avgDaysInStage: 0, atRisk: 0, conversion: 100, likelyToSlip: 0 },
    ],

    sellerFunnel: [
      { name: 'Qualified', token: 'qualified', amount: 402000, count: 6, atRiskAmount: 96000, probability: 25, avgAmount: 67000, avgDaysInStage: 21, atRisk: 1, conversion: 52, likelyToSlip: 96000 },
      { name: 'Proposal', token: 'proposal', amount: 486000, count: 5, atRiskAmount: 118000, probability: 50, avgAmount: 97200, avgDaysInStage: 19, atRisk: 1, conversion: 64, likelyToSlip: 118000 },
      { name: 'Commit', token: 'commit', amount: 418000, count: 4, atRiskAmount: 240000, probability: 75, avgAmount: 104500, avgDaysInStage: 27, atRisk: 1, conversion: 79, likelyToSlip: 240000 },
      { name: 'Backlog', token: 'backlog', amount: 132000, count: 1, atRiskAmount: 0, probability: 90, avgAmount: 132000, avgDaysInStage: 6, atRisk: 0, conversion: 97, likelyToSlip: 0 },
      { name: 'Billed', token: 'billed', amount: 620000, count: 7, atRiskAmount: 0, probability: 100, avgAmount: 88500, avgDaysInStage: 0, atRisk: 0, conversion: 100, likelyToSlip: 0 },
    ],

    sellers: [
      { seller: 'Sofía Torres', quota: 1100000, billed: 620000, forecast: 940000, coverage: 2.6, atRisk: 3, margin: 12.4, accuracy: 91, trend: 4, opportunities: 16, commit: 550000 },
      { seller: 'Camila Paz', quota: 950000, billed: 540000, forecast: 880000, coverage: 3.1, atRisk: 2, margin: 14.1, accuracy: 88, trend: 2, opportunities: 13, commit: 442000 },
      { seller: 'Andrés Coba', quota: 900000, billed: 410000, forecast: 700000, coverage: 2.0, atRisk: 4, margin: 10.6, accuracy: 74, trend: -3, opportunities: 15, commit: 439000 },
      { seller: 'Valeria Núñez', quota: 850000, billed: 260000, forecast: 700000, coverage: 2.2, atRisk: 3, margin: 11.8, accuracy: 82, trend: 6, opportunities: 12, commit: 340000 },
      { seller: 'Diego Andrade', quota: 1000000, billed: 310000, forecast: 520000, coverage: 1.4, atRisk: 6, margin: 8.2, accuracy: 68, trend: -9, opportunities: 14, commit: 186000 },
    ],

    brands: [
      { brand: 'Lenovo', amount: 2140000, margin: 11.8, deals: 24 },
      { brand: 'HP', amount: 1880000, margin: 13.2, deals: 21 },
      { brand: 'Nutanix', amount: 1720000, margin: 15.1, deals: 14 },
      { brand: 'Dell', amount: 1540000, margin: 10.4, deals: 19 },
      { brand: 'Hitachi', amount: 1160000, margin: 8.9, deals: 11 },
    ],

    movements: [
      { label: 'Banco Andino · Core banking renewal', delta: -240000, reason: 'Close date moved to 19 Dec, purchase order still missing', opportunityId: 'OPP-2041' },
      { label: 'Seguros Continental · Policy platform storage', delta: -186000, reason: 'No activity in 16 days, competitor evaluation opened', opportunityId: 'OPP-2103' },
      { label: 'RetailNova · Store network refresh', delta: 275000, reason: 'Pilot approved, moved Qualified → Proposal', opportunityId: 'OPP-2124' },
      { label: 'Seguros Continental · Contact centre virtualization', delta: -164000, reason: 'Year-end spend freeze, close date moved to 30 Dec', opportunityId: 'OPP-2158' },
      { label: 'Hospital San Lucas · Imaging storage', delta: 132000, reason: 'Purchase order received, moved Commit → Backlog', opportunityId: 'OPP-2140' },
    ],

    meetings: [
      { day: 'Today', time: '09:30', who: 'Banco Andino', what: 'Purchase order review with CFO', ctx: 'Commit · $240K', opportunityId: 'OPP-2041' },
      { day: 'Today', time: '14:00', who: 'Morgan Silva', what: 'Forecast preparation (internal)', ctx: null },
      { day: 'Tomorrow', time: '11:00', who: 'Universidad Metropolitana', what: 'Tender award date confirmation', ctx: 'Best case · $148K', opportunityId: 'OPP-2117' },
      { day: 'Tomorrow', time: '16:30', who: 'Grupo Pacífico', what: 'FY27 budget allocation review', ctx: 'Best case · $208K', opportunityId: 'OPP-2163' },
      { day: 'Thursday', time: '10:00', who: 'Cooperativa Andes', what: 'Scoping session — DR site', ctx: 'Pipeline · $198K', opportunityId: 'OPP-2131' },
    ],

    reviewQueue: ['OPP-2041', 'OPP-2103', 'OPP-2158', 'OPP-2088', 'OPP-2182', 'OPP-2140', 'OPP-2176', 'OPP-2124', 'OPP-2163', 'OPP-2117', 'OPP-2131', 'OPP-2146'],
    guidedQueue: ['OPP-2041', 'OPP-2103', 'OPP-2117', 'OPP-2163', 'OPP-2131', 'OPP-2146', 'OPP-2158'],

    copilot: {
      manager: ['Why could we miss quota?', 'What changed since Monday?', 'Which sellers need intervention?', 'Explain forecast movement.', 'Prepare my forecast meeting.'],
      seller: ['What should I do first today?', 'Which deals put my quota at risk?', 'Prepare my forecast update.', 'Draft a follow-up for Banco Andino.'],
      deal: ['Why is this deal at risk?', 'Is Commit justified?', 'What is missing?', 'Prepare next meeting.', 'Draft follow-up.', 'Summarize history.'],
    },

    import: {
      file: 'PROGRAMA VENTAS Q4.xlsx',
      rows: 477, ready: 438, warnings: 31, review: 8, duplicates: 6,
      template: { name: 'TD Forecast Template', confidence: 98 },
      mapping: [
        { source: 'OPPTY', target: 'Opportunity', confidence: 99 },
        { source: 'VBM', target: 'Seller', confidence: 74 },
        { source: 'End User', target: 'Customer', confidence: 96 },
        { source: 'Sales Stage', target: 'Stage', confidence: 91 },
        { source: 'Monto', target: 'Amount', confidence: 88 },
        { source: 'Mes Facturación', target: 'Expected billing', confidence: 63 },
        { source: 'Canal', target: 'Partner', confidence: 57 },
        { source: 'Línea', target: '', confidence: 34 },
      ],
      fields: ['Opportunity', 'Seller', 'Customer', 'Stage', 'Amount', 'Expected close', 'Expected billing', 'Partner', 'Brand', 'Purchase order'],
      issues: [
        { row: 34, severity: 'warning', message: 'Duplicate customer name: "Banco Andino" and "BANCO ANDINO S.A." resolve to the same account' },
        { row: 61, severity: 'warning', message: 'Seller name inconsistency: "D. Andrade" — matched to Diego Andrade at 86% confidence' },
        { row: 88, severity: 'invalid', message: 'Opportunity without amount — row cannot be imported' },
        { row: 112, severity: 'invalid', message: 'Invalid month: "13/2026" is not a valid billing period' },
        { row: 147, severity: 'warning', message: 'Stage / value inconsistency: stage 100% Billed but amount is 0' },
        { row: 203, severity: 'warning', message: 'Seller name inconsistency: "VBM: SOFIA T." — matched to Sofía Torres at 91% confidence' },
        { row: 254, severity: 'invalid', message: 'Stage "Negociación avanzada" does not map to any tenant stage' },
        { row: 311, severity: 'warning', message: 'Duplicate opportunity: same customer, amount and close date as row 34' },
        { row: 366, severity: 'invalid', message: 'Expected close date (14/03/2025) is before the fiscal period' },
        { row: 402, severity: 'warning', message: 'Margin below the 10% tenant threshold (6.2%)' },
      ],
    },
  };
})();

/* Sprint 1 refinement: dated + owned next steps, structured last activity, stage evidence. */
(() => {
  const detail = {
    'OPP-2041': {
      nextStep: { text: 'Call the CFO to confirm the purchase order', date: 'Due 12 Dec · 3 days ago', owner: 'Sofía Torres', overdue: true },
      lastActivity: { what: 'Discovery call with IT director — no decision reached', when: '9 days ago · 4 Dec', who: 'Sofía Torres', stale: true },
      evidence: { present: ['Proposal accepted by IT and Finance', 'Economic buyer identified (CFO)', 'Technical validation complete'], missing: ['Purchase order', 'Signed billing schedule'], verdict: 'Commit is not defensible on current evidence: the close date has moved twice and there is no purchase order at 75%. System confidence 62% — suggested Upside.' },
    },
    'OPP-2088': {
      nextStep: { text: 'Confirm the delivery window with logistics', date: 'Due 16 Dec', owner: 'Camila Paz' },
      lastActivity: { what: 'Commercial review with the CIO — terms agreed', when: '2 days ago · 11 Dec', who: 'Camila Paz' },
      evidence: { present: ['Purchase order received (PO-88412)', 'Proof of concept signed off', 'FY27 budget confirmed'], missing: [], verdict: 'Commit is supported: purchase order in hand and the deal is moving faster than the stage benchmark. System confidence 84%.' },
    },
    'OPP-2103': {
      nextStep: null,
      lastActivity: { what: 'Email to the infrastructure lead — no reply', when: '16 days ago · 27 Nov', who: 'Diego Andrade', stale: true },
      evidence: { present: ['Technical requirements documented'], missing: ['Economic buyer', 'Purchase order', 'Next step'], verdict: 'Commit is not justified. No economic buyer, no activity in 16 days, a competitor evaluation is open and margin is 7.4%. System confidence 41% — suggested Best case.' },
    },
    'OPP-2117': {
      nextStep: { text: 'Confirm the tender award date with procurement', date: 'Due 18 Dec', owner: 'Sofía Torres' },
      lastActivity: { what: 'Requirements workshop with the campus IT board', when: '3 days ago · 10 Dec', who: 'Sofía Torres' },
      evidence: { present: ['Public tender requirements confirmed', 'Reference visit completed'], missing: ['Award date confirmation'], verdict: 'Best case is the right call while the tender award date is unconfirmed.' },
    },
    'OPP-2124': {
      nextStep: { text: 'Agree the January rollout calendar with store operations', date: 'Due 15 Dec', owner: 'Andrés Coba' },
      lastActivity: { what: 'Rollout planning session with operations', when: 'Yesterday · 12 Dec', who: 'Andrés Coba' },
      evidence: { present: ['Pilot approved in 12 stores', 'Rollout plan agreed with operations', 'Operations and IT both sponsoring'], missing: ['Signed rollout calendar'], verdict: 'Stronger than its category: system confidence 78% suggests this can move from Best case to Commit once the calendar is signed.' },
    },
    'OPP-2131': {
      nextStep: { text: 'Identify the budget owner and book a scoping session', date: 'Due 19 Dec', owner: 'Valeria Núñez' },
      lastActivity: { what: 'Call with the risk officer on regulatory drivers', when: '11 days ago · 2 Dec', who: 'Valeria Núñez', stale: true },
      evidence: { present: ['Regulatory driver confirmed'], missing: ['Budget owner', 'Technical scope'], verdict: 'Correctly in Pipeline — stalled 41 days in Qualified with no budget owner.' },
    },
    'OPP-2140': {
      nextStep: { text: 'Confirm invoicing with finance for the December close', date: 'Due 15 Dec', owner: 'Camila Paz' },
      lastActivity: { what: 'Delivery planning with the hospital IT team', when: '4 days ago · 9 Dec', who: 'Camila Paz' },
      evidence: { present: ['Purchase order received (PO-77201)', 'Delivery scheduled'], missing: [], verdict: 'Backlog is correct: won and awaiting billing.' },
    },
    'OPP-2146': {
      nextStep: { text: 'Book the technical assessment and rebuild the margin case', date: 'Due 22 Dec', owner: 'Diego Andrade' },
      lastActivity: { what: 'Email with end-of-support timeline', when: '8 days ago · 5 Dec', who: 'Diego Andrade', stale: true },
      evidence: { present: ['Hardware end of support in Q2'], missing: ['Decision criteria', 'Next step date'], verdict: 'Pipeline is correct. Margin at 8.8% needs rebuilding before this advances.' },
    },
    'OPP-2151': {
      nextStep: { text: 'None — invoiced', date: 'Closed 21 Nov', owner: 'Alex Rivera' },
      lastActivity: { what: 'Invoice INV-4471 issued', when: '21 Nov 2026', who: 'Alex Rivera' },
      evidence: { present: ['Invoiced INV-4471'], missing: [], verdict: 'Billed and reconciled.' },
    },
    'OPP-2158': {
      nextStep: { text: 'Ask procurement whether the PO can be issued before the freeze', date: 'Due 14 Dec', owner: 'Andrés Coba' },
      lastActivity: { what: 'Procurement call on the year-end spend freeze', when: '5 days ago · 8 Dec', who: 'Andrés Coba' },
      evidence: { present: ['Proposal accepted', 'Security review passed'], missing: ['Purchase order'], verdict: 'Commit is optimistic: the close date has moved once and a year-end freeze is in force. System confidence 57% — suggested Upside.' },
    },
    'OPP-2163': {
      nextStep: { text: 'Confirm FY27 budget allocation with the data office', date: 'Due 20 Dec', owner: 'Sofía Torres' },
      lastActivity: { what: 'Business review with the data office', when: '6 days ago · 7 Dec', who: 'Sofía Torres' },
      evidence: { present: ['Business case approved by the data office'], missing: ['FY27 budget confirmation'], verdict: 'Best case is right while a competing internal project holds the same budget.' },
    },
    'OPP-2170': {
      nextStep: { text: 'Run the discovery workshop', date: 'Due 17 Dec', owner: 'Diego Andrade' },
      lastActivity: { what: 'Introductory meeting with the network team', when: '2 days ago · 11 Dec', who: 'Diego Andrade' },
      evidence: { present: [], missing: ['Requirements', 'Budget', 'Timeline'], verdict: 'Not yet qualified — Pipeline is correct.' },
    },
    'OPP-2176': {
      nextStep: { text: 'Track delivery for the December billing window', date: 'Due 18 Dec', owner: 'Camila Paz' },
      lastActivity: { what: 'Logistics confirmation for the warehouse sites', when: '3 days ago · 10 Dec', who: 'Camila Paz' },
      evidence: { present: ['Purchase order received (PO-90233)'], missing: [], verdict: 'Backlog is correct: purchase order received, delivery in progress.' },
    },
    'OPP-2182': {
      nextStep: { text: 'Request the purchase order to protect December billing', date: 'Due 15 Dec', owner: 'Valeria Núñez' },
      lastActivity: { what: 'Commercial call with the treasury lead', when: '4 days ago · 9 Dec', who: 'Valeria Núñez' },
      evidence: { present: ['Proposal accepted', 'Economic buyer identified'], missing: ['Purchase order'], verdict: 'Commit holds, but billing falls into the next quarter unless the purchase order arrives this week.' },
    },
  };
  window.SIP2.opportunities.forEach((o) => {
    const x = detail[o.id];
    if (!x) return;
    o.nextStep = x.nextStep;
    o.lastActivityDetail = x.lastActivity;
    o.evidenceBlock = x.evidence;
  });
})();
