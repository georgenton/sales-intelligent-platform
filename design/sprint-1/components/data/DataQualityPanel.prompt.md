Step 5 of the import wizard: the verdict before anything is written. Four counts, then row-level reasons.

```jsx
<DataQualityPanel counts={{ ready: 182, warnings: 9, invalid: 3, duplicates: 6 }}
  issues={[{ row: 41, severity: 'invalid', message: 'Amount is not a number ("N/D")' }]} onReview={review} />
```
