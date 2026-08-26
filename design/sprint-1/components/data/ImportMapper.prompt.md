Step 3 of the guided import: workbook column → platform field, with per-row mapping confidence.

```jsx
<ImportMapper templateName="TD Forecast Template" templateConfidence={98}
  fields={['Opportunity','Seller','Customer','Stage','Amount','Expected close']}
  rows={[{ source: 'OPPTY', target: 'Opportunity', confidence: 99 }, { source: 'VBM', target: 'Seller', confidence: 74 }]}
  onChange={setMapping} />
```

Source headers render in mono — they are literal file content, not product copy.
