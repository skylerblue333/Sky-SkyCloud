# SkyCloud Plan

**Status: engineering beta / configuration-planning core.** This repository validates bounded deployment-plan metadata without calling any cloud provider.

## Supported today

- provider, region, service, replica and environment-key validation;
- deduplicated environment requirements;
- missing-configuration reporting;
- an explicit configuration-readiness signal;
- an always-false `deploymentPerformed` truth signal;
- strict TypeScript checks and tests.

## Not claimed

This component does not provision AWS/Azure/GCP resources, deploy containers, create networks/databases, read secret values, validate IAM, estimate cost, establish security/compliance, or prove that any infrastructure exists. Configuration completeness is not deployment evidence.

## Development

```bash
npm install
npm run check
npm test
```

## Integration

SKYCOIN4444 can use `assessDeploymentPlan` before handing validated metadata to a separately authenticated deployment system. The deployment system remains responsible for provider APIs, approvals, credentials, rollback, observability, and evidence.

## License

See `LICENSE`.
