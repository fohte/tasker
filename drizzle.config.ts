import '@dotenvx/dotenvx/config' // Use dotenvx

import { defineConfig } from 'drizzle-kit'

if (!process.env.CLOUDFLARE_ACCOUNT_ID) {
  throw new Error('CLOUDFLARE_ACCOUNT_ID environment variable is not set')
}
if (!process.env.CLOUDFLARE_DATABASE_ID) {
  throw new Error('CLOUDFLARE_DATABASE_ID environment variable is not set')
}
if (!process.env.CLOUDFLARE_API_TOKEN) {
  throw new Error('CLOUDFLARE_API_TOKEN environment variable is not set')
}

export default defineConfig({
  schema: './src/db/schema.ts', // Path to your schema file
  out: './drizzle', // Directory to output migrations
  dialect: 'sqlite', // Drizzle uses 'sqlite' dialect for D1
  driver: 'd1-http', // Specify the D1 driver
  dbCredentials: {
    // Ensure these environment variables are set
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID,
    token: process.env.CLOUDFLARE_API_TOKEN,
  },
  verbose: true,
  strict: true,
})
