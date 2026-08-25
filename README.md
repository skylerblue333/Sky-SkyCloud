# SkyCloud Resource Core

**Status: engineering beta / reusable planning core.** SkyCloud Resource Core is a TypeScript desired-state registry for bounded cloud-resource manifests. It validates and catalogs what a caller wants; it does not provision infrastructure.

## Implemented

- resource IDs, providers, resource kinds, regions, sizes, replica counts, and tags are bounded and validated;
- supports explicit `aws`, `azure`, `gcp`, and `local` provider labels without contacting those providers;
- identical registrations are idempotent;
- conflicting desired state for an existing resource ID fails closed;
- deterministic resource listing and tag ordering;
- every plan explicitly reports `infrastructureMutated: false`;
- strict TypeScript, regression tests, production build, package-import smoke test, and dependency-audit CI.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

## SKYCOIN4444 integration

Use this package as a provider-neutral desired-state boundary in front of separately reviewed Terraform, Pulumi, Kubernetes, or cloud-provider adapters. Those adapters must own credentials, IAM, plan/apply approval, secret management, drift detection, cost controls, networking, rollback, and deployment evidence.

## Explicit limitations

This repository does not authenticate cloud accounts, hold provider credentials, call AWS/Azure/GCP APIs, create or delete resources, estimate or guarantee cost, verify quotas, inspect live state, run Terraform/Pulumi, enforce IAM, manage DNS/TLS, deploy applications, provide HA, or prove production infrastructure.

A returned `create` plan means only that the resource is absent from this in-memory desired-state registry. It is not evidence that any infrastructure was created or can be created.

See `SECURITY.md` for the operating boundary and `LICENSE` for licensing terms.
