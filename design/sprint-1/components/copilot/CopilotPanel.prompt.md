The Copilot surface — dark, docked right, and always context-aware. Suggestions must name the current object.

```jsx
<CopilotPanel context="Opportunity" contextLabel="Context · Banco ABC · $180K · Commit"
  suggestions={['Why is this at risk?', 'Is Commit justified?', 'What information is missing?']}
  insights={<CopilotInsight headline="No activity in 9 days" tone="risk" />}
  messages={messages} onAsk={ask} />
```

Never ship it as a floating generic chat bubble. Empty state: insights + suggestions, no message log.
