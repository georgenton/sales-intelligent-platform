Answers "am I going to make quota?" in one bar: solid = billed, translucent = forecast, tick = quota.

```jsx
<QuotaProgress quota={2200000} billed={1180000} forecast={630000} />
<QuotaProgress quota={480000} billed={210000} forecast={160000} compact />
```

Reads as text for screen readers via an `aria-label` on the bar. Empty state: no quota row, show "No quota set for this period".
