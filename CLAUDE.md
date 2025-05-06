# Custom Instructions for LLMs

This file provides guidance to LLMs (like [Claude Code](claude.ai/code)) when working with code in this repository.

## Implementation Guidelines

- **MUST** follow steps after each task
  - Update `docs/todo.md` (mark as done)
  - Commit all changes (use `git add .` to stage all changes, including new files and folders)
  - Run the test using `bun run test` and fix if it fails
- **NEVER** group multiple tasks in one commit
- **NEVER** disable tests or checks to make commits pass; always fix the underlying issues
- **MUST** follow Conventional Commits format like:

  ```
  <type>[optional scope]: <description>

  [optional body]
  ```

- **NEVER** disable tests or checks to make commits pass; always fix the underlying issues

## Build & Development Commands

- Build: `bun run build`
- Dev server: `bun run dev`
- Lint: `bun run lint`
- Test: `bun run test`
- Typecheck: `bun run typecheck`
- Storybook: `bun run storybook`
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
