# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands
- Build: `bun run build`
- Dev server: `bun run dev`
- Lint: `bun run lint`
- Database:
  - Generate migrations: `bun run db:generate`
  - Run migrations: `bun run db:migrate`
  - Database UI: `bun run db:studio`

## Code Style Guidelines
- TypeScript: Use strict typing with interfaces/types for all data structures
- Formatting: 
  - No semicolons
  - Single quotes
  - 2-space indentation
  - ES5 trailing commas
- Imports: Use absolute imports with `@/*` path alias
- Component structure: Follow shadcn/ui patterns with `cn()` utility
- Database: Use Drizzle ORM with SQLite (Cloudflare D1)
- Naming: Use camelCase for variables/functions, PascalCase for components/types
- Error handling: Prefer explicit error types and graceful handling
- Commit messages: Follow Conventional Commits format
  ```
  <type>[optional scope]: <description>
  
  [optional body]
  ```

## Architecture
- Next.js App Router with TypeScript and Tailwind CSS
- Cloudflare Workers for deployment
- GraphQL for API (see docs/architecture/graphql.md)