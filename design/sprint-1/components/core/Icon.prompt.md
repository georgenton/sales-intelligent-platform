Renders a Lucide glyph inline; the icon set the product already ships (lucide-react 0.577).

```jsx
<Icon name="TriangleAlert" size={16} />
<Icon name="Target" size={18} label="Opportunities" />
```

Requires the Lucide UMD script on the page (`https://unpkg.com/lucide@0.577.0/dist/umd/lucide.js`). Decorative by default; pass `label` only when the glyph carries meaning no adjacent text carries. Never use emoji in its place.
