Chip filters plus optional search. Applied chips stay visible with a × so state is never hidden behind a menu.

```jsx
<FilterBar onSearch={setQuery} search={query} applied={['at-risk']} onToggle={toggle} onClear={clear}
  filters={[{ id: 'at-risk', label: 'At risk', count: 12 }, { id: 'commit', label: 'Commit' }]} />
```
