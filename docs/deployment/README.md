# Deployment Guide

This guide covers the deployment setup for the tasker application to Cloudflare Workers.

## Overview

The tasker application is deployed to Cloudflare Workers using the `@opennextjs/cloudflare` adapter, which provides:

- Edge deployment with global distribution
- Native D1 database integration
- Automatic scaling
- Zero cold starts
- Cost-effective hosting

## Quick Start

1. **Set up D1 Database**

```bash
npx wrangler d1 create tasker-db
```

See [D1 Setup Guide](./d1-setup.md) for detailed instructions.

2. **Configure GitHub Secrets**

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_DATABASE_ID`

See [Environment Variables Guide](./environment-variables.md) for details.

3. **Deploy**

```bash
# Preview deployment
bun run deploy:preview

# Production deployment
bun run deploy:production
```

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌──────────┐
│   GitHub    │────▶│ GitHub Actions   │────▶│Cloudflare│
│ Repository  │     │   (CI/CD)        │     │ Workers  │
└─────────────┘     └──────────────────┘     └──────────┘
                            │                       │
                            ▼                       ▼
                    ┌──────────────┐         ┌──────────┐
                    │ Build with   │         │    D1    │
                    │ @opennextjs  │         │ Database │
                    └──────────────┘         └──────────┘
```

## Deployment Workflows

### Production Deployment

- **Trigger**: Push to `master` branch
- **Process**:
  1. Run tests and linting
  2. Build application
  3. Deploy to Cloudflare Workers
  4. Run database migrations
- **URL**: `https://tasker-production.workers.dev`

### Preview Deployment

- **Trigger**: Pull request opened/updated
- **Process**:
  1. Run tests
  2. Build application
  3. Deploy to preview environment
  4. Comment deployment URL on PR
- **URL**: `https://tasker-preview-pr-{number}.workers.dev`

## Key Files

- `wrangler.toml` - Cloudflare Workers configuration
- `open-next.config.ts` - OpenNext adapter configuration
- `.github/workflows/deploy.yml` - Production deployment workflow
- `.github/workflows/preview.yml` - PR preview deployment workflow

## Scripts

| Command                     | Description                         |
| --------------------------- | ----------------------------------- |
| `bun run preview`           | Build and run locally with wrangler |
| `bun run deploy`            | Deploy to default environment       |
| `bun run deploy:preview`    | Deploy to preview environment       |
| `bun run deploy:production` | Deploy to production                |
| `bun run cf-typegen`        | Generate TypeScript types for env   |

## Monitoring

- **Logs**: `npx wrangler tail tasker-production`
- **Metrics**: Cloudflare Dashboard → Workers → Analytics
- **Errors**: Cloudflare Dashboard → Workers → Errors

## Troubleshooting

Common issues and solutions:

1. **Build fails with "Bundle too large"**

- Check bundle size with `npx wrangler deploy --dry-run`
- Optimize imports and use dynamic imports

2. **Database connection errors**

- Verify D1 binding in `wrangler.toml`
- Check database ID matches created database

3. **Deployment fails**

- Ensure all GitHub Secrets are set
- Check Cloudflare API token permissions

## Resources

- [D1 Setup Guide](./d1-setup.md)
- [Environment Variables](./environment-variables.md)
- [Verification Checklist](./verification-checklist.md)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [OpenNext.js Cloudflare Docs](https://opennext.js.org/cloudflare)
