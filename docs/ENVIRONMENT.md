# Environment and deployment configuration

This document is the configuration runbook for Formivo 3D. Values in `.env.example` are names and safe development defaults only; secrets must never be committed.

## Current integration status

| Capability                               | Status                       | Variables used at runtime    |
| ---------------------------------------- | ---------------------------- | ---------------------------- |
| PostgreSQL and Prisma                    | Implemented                  | `DATABASE_URL`               |
| Credential sign-in and database sessions | Implemented                  | `DATABASE_URL`               |
| Application URL                          | Implemented                  | `NEXT_PUBLIC_APP_URL`        |
| Google sign-in                           | Not implemented              | None yet; names are reserved |
| Better Auth                              | Not installed or initialised | None; names are reserved     |
| Razorpay                                 | Not implemented              | None; names are reserved     |
| GraphQL                                  | Not installed or exposed     | None                         |

The current authentication code creates random session tokens and persists them in PostgreSQL. `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` do not enable Google authentication by themselves. An authentication adapter and callback route must be implemented before those values are operational.

## Local environment

### 1. Create the configuration file

```bash
cp .env.example .env
```

`.env` is ignored by Git. Keep `.env.example` free of real credentials.

### 2. Start PostgreSQL

The repository includes PostgreSQL 16 in Docker Compose:

```bash
docker compose up -d postgres
docker compose ps
```

The matching local connection string is:

```dotenv
DATABASE_URL="postgresql://formivo:formivo@localhost:5432/formivo"
```

If the application itself is later run inside Docker Compose, use the service hostname `postgres`, not `localhost`:

```dotenv
DATABASE_URL="postgresql://formivo:formivo@postgres:5432/formivo"
```

### 3. Generate a development secret

The reserved authentication secret must contain at least 32 characters. Generate rather than invent it:

```bash
openssl rand -base64 32
```

Paste the output into `BETTER_AUTH_SECRET` in `.env`. It is not consumed by the current custom credential-session implementation, but it will be required if the proposed authentication adapter is adopted.

### 4. Prepare and run the application

```bash
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Open `http://localhost:3000`. Use `pnpm db:reset` only when deleting all local database data is acceptable.

## Obtaining Google OAuth credentials

Complete these steps when the Google provider is implemented, not merely to populate unused variables.

1. Open the [Google Cloud Console](https://console.cloud.google.com/) and create or select a project.
2. Configure **Google Auth Platform**: application name, support email, audience, contact details, and requested scopes. Basic sign-in normally needs `openid`, `email`, and `profile`.
3. During external-app testing, add the required Google accounts as test users. Complete Google's verification process before requesting sensitive scopes or making a restricted application broadly available.
4. Create an **OAuth client ID** with application type **Web application**.
5. Add exact authorised JavaScript origins:
   - Local: `http://localhost:3000`
   - Production: the final HTTPS origin, for example `https://app.example.com`
6. Add the exact callback URI implemented by the selected authentication library. A recommended convention is:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://app.example.com/api/auth/callback/google`
7. Copy the client ID and client secret into the environment's secret manager as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

Redirect URIs are exact-match values: scheme, host, port, path, and trailing slash must agree with the application callback. Never prefix the client secret with `NEXT_PUBLIC_`; variables with that prefix are included in browser bundles.

## Production configuration

Use the hosting platform's encrypted environment/secret manager. Do not upload `.env` or paste secrets into build logs.

| Variable               | Production requirement                                                       | Source                                      |
| ---------------------- | ---------------------------------------------------------------------------- | ------------------------------------------- |
| `NODE_ENV`             | `production`                                                                 | Hosting platform/runtime                    |
| `NEXT_PUBLIC_APP_URL`  | Required, public HTTPS origin with no trailing path                          | Production domain                           |
| `DATABASE_URL`         | Required, TLS-enabled pooled PostgreSQL URL where supported                  | Managed PostgreSQL provider                 |
| `BETTER_AUTH_URL`      | Required only after Better Auth is adopted; normally the public HTTPS origin | Production domain                           |
| `BETTER_AUTH_SECRET`   | Required only after Better Auth is adopted; unique high-entropy value        | `openssl rand -base64 32` or secret manager |
| `GOOGLE_CLIENT_ID`     | Required only after Google sign-in is implemented                            | Google Cloud OAuth client                   |
| `GOOGLE_CLIENT_SECRET` | Required only after Google sign-in is implemented                            | Google Cloud OAuth client                   |
| `RAZORPAY_KEY_ID`      | Required only after payment integration; use live key in production          | Razorpay dashboard                          |
| `RAZORPAY_KEY_SECRET`  | Required only after payment integration                                      | Razorpay dashboard                          |

Production release order:

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm prisma migrate deploy
pnpm build
pnpm start
```

Run `prisma migrate deploy` once per release from a deployment job, not concurrently from every application replica. Use a database role with only the privileges required by the application, require TLS, enable automated backups and point-in-time recovery, and monitor connection usage. Some serverless providers supply a pooled runtime URL and a direct migration URL; if adopted, model both explicitly in Prisma rather than guessing provider parameters.

## Secret lifecycle checklist

- Maintain separate OAuth clients, databases, and secrets for local/development, staging, and production.
- Restrict production-secret access to the deployment service and authorised operators.
- Rotate a credential immediately if it enters Git history, a screenshot, an issue, or a log.
- Coordinate authentication-secret rotation because replacing a session-signing secret may invalidate sessions after an adapter is introduced.
- Keep database backups encrypted and test restoration regularly.
- Validate the deployed `/search` endpoint and sign-in flow after every configuration change.

## Troubleshooting

- **Prisma cannot connect:** verify the container with `docker compose ps`, check port `5432`, and confirm the hostname is appropriate for host versus container execution.
- **Tables are missing:** run `pnpm db:migrate`; use `pnpm prisma migrate deploy` in production.
- **Search reports unavailable:** verify `DATABASE_URL`, migrations, and seed data. `/search` is database-backed.
- **Google `redirect_uri_mismatch`:** compare the emitted callback URL character-for-character with the authorised redirect URI in Google Cloud.
- **Google button is absent:** expected today; OAuth routes and UI have not yet been implemented.
