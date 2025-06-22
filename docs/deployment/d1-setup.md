# D1 Database Setup Guide

This guide explains how to set up Cloudflare D1 database for the tasker application.

## Prerequisites

- Cloudflare account
- Wrangler CLI installed (`bun add -d wrangler`)
- Cloudflare API token with D1 permissions

## Setup Steps

### 1. Create D1 Database

Create a new D1 database using wrangler:

```bash
npx wrangler d1 create tasker-db
```

This will output something like:

```
✅ Successfully created DB 'tasker-db' in region US
Created your new D1 database.

[[d1_databases]]
binding = "DB"
database_name = "tasker-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2. Update wrangler.toml

Copy the `database_id` from the output above and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "tasker-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" # Replace with your actual database ID
```

### 3. Run Database Migrations

Apply the database schema to your D1 database:

```bash
# Generate migrations (if not already done)
bun run db:generate

# Apply migrations to local D1
npx wrangler d1 migrations apply tasker-db --local

# Apply migrations to remote D1 (production)
npx wrangler d1 migrations apply tasker-db --remote
```

### 4. Verify Database Setup

You can verify the database is set up correctly:

```bash
# List tables in local database
npx wrangler d1 execute tasker-db --local --command "SELECT name FROM sqlite_master WHERE type='table';"

# List tables in remote database
npx wrangler d1 execute tasker-db --remote --command "SELECT name FROM sqlite_master WHERE type='table';"
```

## Environment Variables

The following environment variables are required for D1:

- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
- `CLOUDFLARE_DATABASE_ID`: The D1 database ID
- `CLOUDFLARE_API_TOKEN`: API token with D1 permissions

These should be set in GitHub Secrets for CI/CD.

## Troubleshooting

### Database not found error

If you get a "database not found" error, ensure:

1. The database ID in wrangler.toml matches the one from creation
2. You're logged in to the correct Cloudflare account (`npx wrangler whoami`)

### Migration errors

If migrations fail:

1. Check the SQL syntax in your migration files
2. Ensure the database exists and is accessible
3. Try running migrations with `--dry-run` flag first

## Next Steps

After setting up D1:

1. Test the database connection locally with `bun run preview`
2. Deploy to Cloudflare Workers with `bun run deploy`
3. Monitor database usage in Cloudflare dashboard
