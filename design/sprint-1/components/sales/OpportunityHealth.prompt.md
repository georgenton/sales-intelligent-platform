The explainable health score. Arc + number + status word + icon — colour is never the only signal.

```jsx
<OpportunityHealth score={42} status="CRITICAL" showFactors size="lg"
  factors={[{ code: 'STAGE_STAGNATION', impact: -18, message: '41 days in Commit' }]} />
```

In tables use `size="sm"` without factors; in the drawer use `size="lg"` with `showFactors`.
