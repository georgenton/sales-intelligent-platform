The default way to inspect an opportunity from any dashboard: a 480px right drawer that keeps the dashboard behind it.

```jsx
<OpportunityDrawer open={!!selected} opportunity={selected} onClose={close} onOpenFull={goToRecord}
  quickActions={[{ label: 'Add activity', primary: true }, 'Add next step', 'Change stage', 'Update forecast', 'Add note', 'Ask Copilot']}
  onQuickAction={run} />
```

Reading order is deliberate: **next step (dated, owned)** → **last meaningful customer activity** → **"why is this Commit?"** evidence → facts → velocity → stage history. When `nextStep` is absent the drawer says so in danger tone — a missing commitment is the finding.

Escape closes. Clicking a deal should open this — not navigate. The full record page is an escalation, not the default.
