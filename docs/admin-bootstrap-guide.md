# QivroPay Administrative User Bootstrap Guide

## Overview

QivroPay enforces strict zero-hardcoded credential and non-automatic provisioning policies. When deploying a fresh database or spinning up a new platform environment, administrative users are **never** provisioned automatically and default credentials do not exist in source code.

Platform administrators must explicitly initialize the initial administrative account using the secure bootstrap CLI tool.

---

## Security Model & Guarantees

1. **Explicit Execution Only**: The database will never automatically create an administrative user merely because `qivropay_admin_users` is empty.
2. **Strict Minimum Entropy**: Administrative passwords must be at least 12 characters long.
3. **Cryptographic Salting & Hashing**: All passwords are hashed using Node.js `crypto.scrypt` with a cryptographically secure 16-byte random salt. Plaintext passwords are never persisted.
4. **Zero-Echo Security**: The bootstrap CLI never logs or echoes plaintext passwords to `stdout`, `stderr`, logs, or console traces.
5. **Idempotency Guard**: Attempting to bootstrap an existing admin email fails safely with an error and will not overwrite credentials.

---

## Bootstrapping an Initial Administrator

### Method 1: Interactive / CLI Arguments

Run the `admin:bootstrap` npm script with explicit arguments:

```bash
npm run admin:bootstrap -- \
  --email "security-admin@qivrocorp.internal" \
  --password "YourStrongSuperSecretPassword2026!#" \
  --name "Platform Super Admin" \
  --role "super_admin"
```

#### CLI Options

| Argument | Required | Description | Default |
| :--- | :--- | :--- | :--- |
| `--email` | **Yes** | Valid corporate email address for the admin | — |
| `--password` | **Yes** | Administrative password (min 12 characters) | — |
| `--name` | No | Full display name for the administrator | `'System Administrator'` |
| `--role` | No | Administrative role (`super_admin`, `compliance_officer`, `support_lead`, `operations_analyst`, `read_only`) | `'super_admin'` |

---

### Method 2: Environment Variables (Recommended for CI/CD / Automated Deployment)

When provisioning during automated infrastructure setups (e.g. Terraform, Kubernetes init-container, or Docker entrypoint), pass credentials securely via environment variables:

```bash
export BOOTSTRAP_ADMIN_EMAIL="security-admin@qivrocorp.internal"
export BOOTSTRAP_ADMIN_PASSWORD="YourStrongSuperSecretPassword2026!#"
export BOOTSTRAP_ADMIN_NAME="Platform Super Admin"
export BOOTSTRAP_ADMIN_ROLE="super_admin"

npm run admin:bootstrap
```

---

## Role-Based Access Control (RBAC) Reference

| Role | Intended Permissions |
| :--- | :--- |
| `super_admin` | Full administrative authority across all modules, configuration, and tenant settings |
| `compliance_officer` | Merchant KYC verification, compliance status management, and audit inspection |
| `support_lead` | Merchant support ticket oversight, agent reassignment, and SLA monitoring |
| `operations_analyst` | Settlement reviews, batch exports, and platform transaction analytics |
| `read_only` | Read-only inspection across admin interfaces without modification privileges |

---

## Post-Bootstrap Verification

After bootstrapping:
1. Log in via `https://client.qivropay.com` using the bootstrapped credentials.
2. An `HttpOnly`, `SameSite=Strict`, `Secure` session cookie (`qivropay_admin_session`) is issued.
3. Plaintext passwords or session tokens are never exposed in JSON response payloads.
4. An immutable audit record (`admin_bootstrap`) is logged in `qivropay_admin_audit_logs`.
