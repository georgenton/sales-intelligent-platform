The pipeline as a true funnel: bands narrow toward cash, hover exposes mechanics, click expands detail **in place** — never navigates.

```jsx
<SalesFunnel
  stages={[
    { name: 'Discovery', token: 'discovery', amount: 1240000, count: 18, probability: 25, avgDaysInStage: 22, atRisk: 4 },
    { name: 'Proposal', token: 'proposal', amount: 860000, count: 11, probability: 50, avgDaysInStage: 17 },
    { name: 'Commit', token: 'commit', amount: 610000, count: 7, probability: 75, atRisk: 3, likelyToSlip: 180000 },
    { name: 'Billed', token: 'billed', amount: 1180000, count: 14, probability: 100 },
  ]}
  renderDetail={(stage) => <StageBreakdown stage={stage} />} />
```

Ships a visually-hidden data table for screen readers. Loading: 4 grey bands. Empty: "No open pipeline in this period."
