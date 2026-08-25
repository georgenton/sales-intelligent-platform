# ADR-008: AI provider abstraction

- Status: Accepted
- Date: 2026-08-25

## Decision

Business code constructs a minimal deterministic manager-brief context, then calls `AiProvider`.
Local and default deployments use `MockAiProvider`, which creates a deterministic narrative without a
key. Model output is advisory and never mutates opportunities.

## Consequences

The product is fully functional offline. A future OpenAI Responses API adapter can be added at the
infrastructure boundary with configurable model and redacted metrics; Azure OpenAI or Bedrock do not
enter the domain layer.
