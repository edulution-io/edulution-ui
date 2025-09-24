# Repository Guidelines

## Project Structure & Module Organization

- apps/frontend: React + Vite app (UI). Env files: `apps/frontend/.env.development` (see `.env.default`).
- apps/api: NestJS service (API). Env files: `apps/api/.env` (see `.env.default`).
- libs: Shared TypeScript utilities and UI modules used by apps.
- scripts, docs, swagger-spec.json: Helper scripts, documentation, and OpenAPI spec.
- dist, coverage: Build outputs and test coverage (generated).

## Build, Test, and Development Commands

- Install: `npm install`
- Start frontend: `npm run dev` (Vite dev server on http://localhost:5173)
- Start API: `npm run api` (Nest on http://localhost:3001)
- Both apps: `npm run serveFrontendAndApi`
- Build frontend/API/all: `npm run build`, `npm run build:api`, `npm run build:all`
- Tests: `npm run test` (API), `npm run test:frontend`, coverage with `npm run coverage`
- Lint/format: `npm run lint`, `npm run lint:fix`, staged formatting via pre-commit
- Local infra (Mongo/Redis): `docker compose up -d` (see `docker-compose.yml`)

## Coding Style & Naming Conventions

- Stack: TypeScript, React 18, NestJS 11, Nx workspace.
- Linting: ESLint (Airbnb + TypeScript, a11y, import rules). Run `npm run lint`.
- Formatting: Prettier (2 spaces, 120 cols, single quotes, trailing commas). Run `npm run format`.
- React: Function components as arrow functions; allow prop spreading; avoid `console` except `info|warn|error`.
- File names: TypeScript `*.ts|*.tsx`; shared code lives under `libs/`.
- Never comment in the code.

## Testing Guidelines

- Frontend/libs: Vitest; setup at `apps/frontend/test/vitest.setup.ts`.
- API: Jest; config under `apps/api/jest.config.ts`.
- Conventions: Co-locate tests with source using `*.spec.ts(x)` or project `test/` folders.
- Run: `npm run test:frontend` for UI, `npm run test:api` for API; add assertions and keep tests fast and deterministic.

## Commit & Pull Request Guidelines

- Commits: Use imperative mood, small focused changes, reference issues (e.g., `Fix bulletin formatting (#1125)`).
- Branches: Short, descriptive names (e.g., `1120-add-support-for-parent-role`).
- PRs: Include problem, approach, testing notes, linked issues, and screenshots/GIFs for UI. Ensure CI passes and `npm run lint` is clean.

## Security & Configuration Tips

- Do not commit secrets. Use `.env` files per app and required OIDC certificate file in repo root (see README).
- Pre-commit runs checks (circular deps, translations, filenames, license headers). Fix before pushing.
