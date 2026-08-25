# Security Policy

SkyCloud Resource Core is an engineering-beta desired-state library. It is not a cloud security boundary and performs no infrastructure mutation.

## Current controls

- Resource and tag inputs are bounded and validated.
- Unknown provider/resource-kind labels are rejected.
- Replica counts are bounded.
- Reusing a resource ID with different desired state fails closed.
- The library has no network or credential-handling code.
- Returned plans explicitly report `infrastructureMutated: false`.

## Integration requirements

Cloud credentials, workload identity, IAM/RBAC, state encryption, secret management, plan approval, provider allowlists, network policy, logging, cost controls, drift detection, backup/restore, and deployment rollback belong to the integrating infrastructure layer and must be independently reviewed and verified.

Do not place passwords, API keys, private keys, account credentials, or sensitive customer data into resource IDs, regions, sizes, or tag values. Treat generated manifests as configuration metadata, not authorization to create infrastructure.

Report suspected vulnerabilities through GitHub private vulnerability reporting when available. Do not publish live cloud credentials, account identifiers, Terraform state, or exploitable environment details in public issues.
