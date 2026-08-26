The only correct way to mark risk in this system: colour **and** icon **and** label.

```jsx
<RiskBadge severity="CRITICAL" code="MISSING_PO" />
<RiskBadge severity="WARNING" label="Low margin" />
```

Severities match the API alert enum: INFO, WARNING, HIGH, CRITICAL.
