import { drizzle } from 'drizzle-orm/d1';
import { getRequestContext } from '@cloudflare/next-on-pages';

// Utility function to get the D1 binding safely
function getD1Binding(): D1Database {
  try {
    // For Pages Functions, use getRequestContext
    const context = getRequestContext();
    if (context?.env?.DB) {
      return context.env.DB;
    }
  } catch (e) {
    // Ignore errors if not in a Pages Function context
  }

  // Fallback for local development or other environments
  // Ensure 'wrangler dev --local' provides the binding or use process.env
  // IMPORTANT: Replace 'DB' with your actual D1 binding name in wrangler.toml
  //            and ensure it's accessible in your dev environment.
  if (process.env.NODE_ENV === 'development' && globalThis.__env__?.DB) {
     // Accessing bindings provided by 'wrangler dev --local' via globalThis
     return globalThis.__env__.DB as D1Database;
  }

  // If running outside of Cloudflare Pages/Workers context during build or locally without wrangler dev
  // you might need a different way to connect or mock the DB.
  // Throwing an error might be appropriate if DB access is critical here.
  console.warn("D1 binding 'DB' not found. Using placeholder.");
  // Return a placeholder or throw an error depending on requirements
  // This placeholder will likely cause runtime errors if used.
  return {
    prepare: () => ({ bind: () => ({ all: async () => ({ results: [] }) }) }),
    dump: async () => new ArrayBuffer(0),
    batch: async () => [],
    exec: async () => ({ count: 0, duration: 0 }),
  } as unknown as D1Database;
}

export const db = drizzle(getD1Binding());

// Re-export schema items if needed elsewhere
export * from './schema';

// Note: Accessing environment variables or bindings directly at the top level
// can be problematic in edge environments. The getD1Binding function attempts
// to retrieve the binding dynamically when needed. Ensure your D1 binding
// is named 'DB' in your wrangler.toml or adjust the code accordingly.