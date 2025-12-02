# Admin Portal Consumer Contracts

This repository contains Pact tests for the Admin Portal, which reuses the Catalog service API to power administrative workflows.

## Local setup

```bash
npm install
npm test
```

Pact files are emitted to `pacts/`. Automation copies them into the contracts repository so providers can verify the changes before merging.

## CI Flow

The `.github/workflows/pact-consumer.yml` workflow runs on every pull request, generates fresh contracts, opens a pull request against the shared contracts repository, and notifies the Catalog provider for verification.

Remember to configure the repository secrets (`CONTRACT_PAT`) and environment variables (`ORG_NAME`, `CONTRACTS_REPO`, `PROVIDER_REPO`) before enabling the workflow.
