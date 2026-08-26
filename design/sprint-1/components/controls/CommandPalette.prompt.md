⌘K keyboard-first entry point: find a customer, opportunity or seller; create; open forecast review; ask Copilot.

```jsx
<CommandPalette open={open} onClose={close} onSelect={run}
  commands={[{ id:'find', label:'Find customer', group:'Navigate' }, { id:'risk', label:'View opportunities at risk', group:'Review', hint:'12' }]} />
```

Arrow keys move, Enter runs, Escape closes. The host page owns the ⌘K listener.
