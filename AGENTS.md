# AGENTS.md

Guidelines for agentic coding agents working in this repository.

## Project Overview

This is a Node.js / TypeScript project. Follow the conventions below when writing or modifying code.

## Build / Lint / Test Commands

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Build | `npm run build` |
| Dev server | `npm run dev` |
| Lint | `npm run lint` |
| Lint + auto-fix | `npm run lint -- --fix` |
| Type-check | `npm run typecheck` |
| Format | `npm run format` |
| Run all tests | `npm test` |
| Run single test file | `npx vitest run path/to/file.test.ts` |
| Run single test by name | `npx vitest run -t "test name"` |
| Run single test (Jest) | `npx jest path/to/file.test.ts -t "test name"` |

Always run `npm run lint` and `npm run typecheck` after making code changes.

## Code Style

### General
- Use TypeScript strict mode (`"strict": true` in tsconfig).
- Prefer `const` over `let`; never use `var`.
- Use early returns to reduce nesting.
- Keep functions small and focused (single responsibility).
- No commented-out code. Use git history if needed.

### Imports
- Order: (1) node built-ins, (2) external packages, (3) internal modules, (4) types.
- Use named exports over default exports.
- Use `import type { ... }` for type-only imports.
- Avoid barrel files (`index.ts` re-exports) in large modules.

```ts
import { readFile } from 'node:fs/promises';       // built-ins
import { z } from 'zod';                            // external
import { UserService } from '@/services/user';      // internal
import type { User } from '@/types/user';           // types
```

### Naming Conventions
| Item | Convention | Example |
|------|-----------|---------|
| Files | kebab-case | `user-service.ts` |
| Classes/PascalCase types | PascalCase | `UserService`, `UserProfile` |
| Interfaces | PascalCase, no `I` prefix | `UserProfile`, not `IUserProfile` |
| Variables/functions | camelCase | `getUserById` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRIES` |
| Enums | PascalCase members | `Status.Active` |
| Booleans | `is`/`has`/`can` prefix | `isActive`, `hasPermission` |
| Test files | `*.test.ts` or `*.spec.ts` | `user-service.test.ts` |

### Types
- Avoid `any`. Use `unknown` and narrow with type guards.
- Prefer `interface` for object shapes; `type` for unions, intersections, and utility types.
- Use explicit return types on exported functions.
- Use `satisfies` operator for type-safe object literals when applicable.

### Error Handling
- Use typed errors or discriminated unions for error results.
- Wrap external calls (API, DB, filesystem) in try/catch.
- Never swallow errors silently — log or rethrow.
- Use `Result<T, E>` pattern or `try/catch` consistently across the codebase.

```ts
// Preferred: typed result
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

// Preferred: meaningful error messages
throw new Error(`Failed to fetch user ${id}: ${response.statusText}`);
```

### Async/Await
- Always use `async/await` over raw Promises or `.then()` chains.
- Use `Promise.all()` for parallel independent operations.
- Avoid floating promises (always `await` or explicitly handle).

### Testing
- Colocate test files with source: `user-service.ts` → `user-service.test.ts`.
- Use descriptive test names: `it('should return null when user not found')`.
- Follow Arrange-Act-Assert pattern.
- Mock external dependencies; don't hit real APIs/DBs in unit tests.

## Development Workflow (OpenSpec + TDD)

### OpenSpec Process
All feature development must follow the OpenSpec flow:
1. **Spec first** — before writing code, create/update spec files under `specs/` describing inputs, outputs, constraints, and acceptance criteria.
2. **Plan** — break the spec into implementable tasks; list them in a todo or issue.
3. **Implement** — write code to satisfy the spec.
4. **Verify** — run tests against the spec; confirm all acceptance criteria are met.

### Test-Driven Development (TDD)
- Write the test **before** the implementation. The red → green → refactor cycle is mandatory.
- Tests must be written to **verify correctness of behavior**, not merely to make a suite pass.
  - Do NOT weaken assertions, use `any` casts, or replace real logic with stubs just to pass a test.
  - Do NOT delete or skip a failing test without first confirming the underlying problem is resolved.
  - If a test reveals a bug in the production code, fix the production code — never simplify the test.
- Each test should cover a meaningful scenario: edge cases, boundary conditions, and error paths — not just the happy path.

### Debugging & Analysis Rules
- When investigating a bug or failure, **reasoning alone is not sufficient**.
- Always collect concrete evidence: console logs, state snapshots, debugger output, or trace data.
- Analysis must be grounded in observed data — never assume or guess root causes without supporting evidence.
- Document the root cause and fix rationale in commit messages or PR descriptions.

### Formatting
- Use the project's Prettier/ESLint config (run `npm run format`).
- 2-space indentation. Single quotes. Trailing commas (es5).
- Max line length: 100 characters.

## File Structure

```
src/
├── index.ts          # Entry point
├── types/            # Shared type definitions
├── services/         # Business logic
├── utils/            # Pure helper functions
├── middleware/        # Express/Hono middleware (if applicable)
└── __tests__/        # Integration tests (if not colocated)
```

## Commit Conventions
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.
- Keep commits atomic — one logical change per commit.
- Do not commit secrets, API keys, or `.env` files.

## When Stuck
- Check existing code for patterns before introducing new ones.
- Prefer the standard library and existing dependencies over adding new packages.
- If the user asks about opencode, see https://opencode.ai for docs.
