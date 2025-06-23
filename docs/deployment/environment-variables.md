# Environment Variables Management

This document describes how environment variables are managed for the tasker application deployment.

## Required Environment Variables

### GitHub Secrets (for CI/CD)

The following secrets must be configured in your GitHub repository settings:

| Secret Name              | Description                         | How to Obtain                                                                                      |
| ------------------------ | ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN`   | API token for Cloudflare deployment | [Create API Token](https://dash.cloudflare.com/profile/api-tokens) with "Edit Workers" permissions |
| `CLOUDFLARE_ACCOUNT_ID`  | Your Cloudflare account ID          | Found in Cloudflare dashboard → Right sidebar                                                      |
| `CLOUDFLARE_DATABASE_ID` | D1 database ID                      | Obtained when creating D1 database with `wrangler d1 create`                                       |

### Setting GitHub Secrets

1. Go to your repository on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with its corresponding value

### Local Development

For local development, create a `.env.local` file:

```bash
# .env.local
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_DATABASE_ID=your_database_id
CLOUDFLARE_API_TOKEN=your_api_token
```

**Note**: `.env.local` is already in `.gitignore` and should never be committed.

## Application Environment Variables

### Runtime Variables

These can be set in `wrangler.toml` or via Cloudflare dashboard:

```toml
[vars]
# Example application variables
APP_ENV = "production"
LOG_LEVEL = "info"
```

### Environment-specific Variables

Different values for different environments:

```toml
# Preview environment
[env.preview.vars]
APP_ENV = "preview"
LOG_LEVEL = "debug"

# Production environment
[env.production.vars]
APP_ENV = "production"
LOG_LEVEL = "info"
```

## Managing Secrets in Cloudflare

For sensitive data that shouldn't be in `wrangler.toml`:

```bash
# Set a secret for production
npx wrangler secret put SECRET_NAME --env production

# Set a secret for preview
npx wrangler secret put SECRET_NAME --env preview
```

## Best Practices

1. **Never commit secrets**: Use GitHub Secrets or Cloudflare Secrets
2. **Use environment-specific values**: Different values for preview/production
3. **Document all variables**: Keep this list updated with new variables
4. **Rotate tokens regularly**: Update API tokens periodically
5. **Principle of least privilege**: Use tokens with minimal required permissions

## Troubleshooting

### Missing environment variable errors

1. Check GitHub Secrets are properly set
2. Verify variable names match exactly (case-sensitive)
3. Ensure workflows have proper permissions

### Local development issues

1. Check `.env.local` file exists and has correct values
2. Restart development server after changing environment variables
3. Use `npx wrangler whoami` to verify authentication

## Type Safety

Generate TypeScript types for Cloudflare environment:

```bash
bun run cf-typegen
```

This creates `cloudflare-env.d.ts` with proper types for your environment variables.
