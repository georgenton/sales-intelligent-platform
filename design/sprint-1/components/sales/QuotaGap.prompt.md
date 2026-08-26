Not a KPI tile — an interpretation. Sits at the top of Manager Home under the KPI row.

```jsx
<QuotaGap gap={390000}
  interpretation="Your current forecast is $390K below quota. Three opportunities representing $510K account for most of the quarter risk."
  drivers={[{ label: 'Banco ABC · no activity 9 days', amount: 180000 }]}
  action="Review risks" onAction={openRisks} />
```
