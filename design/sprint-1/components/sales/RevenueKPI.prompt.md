A single measured number with the qualifier that makes it decidable. Never ship one without `detail` or `delta`.

```jsx
<RevenueKPI label="Forecast" value={1810000} detail="82.3% attainment" icon={<Icon name="CircleGauge" />} />
<RevenueKPI label="Gap" value={-390000} tone="risk" detail="to billed quota" hero />
```

Loading: render the tile with a 24px skeleton bar in place of the value. Empty: em dash plus "no quota set for this period".
