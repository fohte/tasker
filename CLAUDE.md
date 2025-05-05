# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Implementation Guidelines
- **MUST** read `docs/todo.md` and implement the **first unchecked task only**
- **MUST** insert tasks into todo.md if new tasks are identified
- After each task **MUST** update `docs/todo.md` (mark as done) and commit changes including `docs/todo.md`
- **NEVER** group multiple tasks in one commit
- **MUST** Ffllow Conventional Commits format like:
  ```
  <type>[optional scope]: <description>
  
  [optional body]
  ```

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

## Architecture
- Next.js App Router with TypeScript and Tailwind CSS
- Cloudflare Workers for deployment
- GraphQL for API (see docs/architecture/graphql.md)
