# Railway infrastructure

This directory is the single source of truth for the dedicated
`sales-intelligence-staging` Railway project.

Use Node.js 24 and the Railway agent identity headers documented in the
deployment runbook. Always review a plan before applying changes:

```bash
railway link --project 41294bdf-df6c-4aeb-b813-157054d14247 --environment staging
railway config plan --detailed-exit-code
railway config apply
```

`preserve()` keeps the existing secret values in Railway without committing
them to source control. Only link and apply this file to the dedicated
`staging` environment identified above.
