One step of Guided Mode — opportunity review, missing-data completion, forecast preparation. Progress is always visible.

```jsx
<GuidedTask step={2} total={5} title="Confirm the close date" why="Two deals in Commit close after the quarter ends."
  onPrimary={next} onSkip={skip} onBack={back}>
  <Input label="Expected close" type="date" />
</GuidedTask>
```

One decision per step. Never more than seven steps in a workflow.
