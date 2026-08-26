The action control — one `primary` per view, everything else `outline` or `ghost`.

```jsx
<Button icon={<Icon name="Plus" />}>New opportunity</Button>
<Button variant="outline" size="sm">Export</Button>
<Button variant="onDark" size="sm" icon={<Icon name="RefreshCw" />}>Generate brief</Button>
```

Sizes 32/40/48px. `size="icon"` is a 40px square — always give it `aria-label`. Hover darkens; there is no scale or shadow change.
