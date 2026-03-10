---
phase: 03-cli-scaffolding
plan: 02
subsystem: cli
tags: [vite, react, typescript, tailwind, axios, oidc, vitest, templates]

requires:
  - phase: 03-cli-scaffolding-01
    provides: CLI package structure, scaffold engine, constants (RENAME_MAP, PLACEHOLDER_DEFAULTS, TEXT_EXTENSIONS)
provides:
  - Complete custom-app template set (base + 4 feature overlays)
  - Base Vite+React+TS project template with {{PROJECT_NAME}} placeholder
  - Tailwind feature overlay with edulution theme (CSS custom properties, light/dark)
  - API client feature overlay with configured axios (withCredentials, VITE_EDU_API_URL)
  - Auth feature overlay with OIDC AuthProvider and useAuth hook
  - Tests feature overlay with Vitest + testing-library + jsdom
affects: [03-cli-scaffolding-03, 03-cli-scaffolding-04, 04-documentation]

tech-stack:
  added: [react-oidc-context, oidc-client-ts, tailwindcss, postcss, autoprefixer, axios, vitest, jsdom, testing-library]
  patterns: [feature-overlay-merging, css-custom-property-theming, package-json-fragment-merging]

key-files:
  created:
    - edulution-ai-framework/cli/templates/custom-app/base/package.json
    - edulution-ai-framework/cli/templates/custom-app/base/vite.config.ts
    - edulution-ai-framework/cli/templates/custom-app/base/src/main.tsx
    - edulution-ai-framework/cli/templates/custom-app/base/src/App.tsx
    - edulution-ai-framework/cli/templates/custom-app/features/tailwind/tailwind.config.ts
    - edulution-ai-framework/cli/templates/custom-app/features/tailwind/src/index.css
    - edulution-ai-framework/cli/templates/custom-app/features/tailwind/src/main.tsx
    - edulution-ai-framework/cli/templates/custom-app/features/tailwind/index.html
    - edulution-ai-framework/cli/templates/custom-app/features/api-client/src/api/apiClient.ts
    - edulution-ai-framework/cli/templates/custom-app/features/auth/src/auth/AuthProvider.tsx
    - edulution-ai-framework/cli/templates/custom-app/features/auth/src/auth/useAuth.ts
    - edulution-ai-framework/cli/templates/custom-app/features/tests/vitest.config.ts
    - edulution-ai-framework/cli/templates/custom-app/features/tests/src/test/App.spec.tsx
  modified: []

key-decisions:
  - 'Used var(--token) directly in Tailwind config (not hsl wrapper) to match edulution-ui hex-based CSS custom properties'
  - 'Each feature overlay has isolated package.json fragment with only its own dependencies for clean deep-merging'
  - 'Auth overlay excludes axios dependency since api-client overlay is auto-selected when auth is chosen'

patterns-established:
  - 'Feature overlay pattern: package.json fragment + source files, deep-merged with base during scaffold'
  - 'Tailwind overlay replaces both main.tsx (CSS import switch) and index.html (Lato font + theme class)'
  - 'Template placeholder convention: {{PROJECT_NAME}}, {{EDU_API_URL}}, {{AUTH_CLIENT_ID}} matching PLACEHOLDER_DEFAULTS'

requirements-completed: [CLI-02, CLI-05, CLI-06, CLI-07, CLI-08]

duration: 4min
completed: 2026-03-10
---

# Phase 3 Plan 2: Custom App Templates Summary

**Complete custom-app template set with base Vite+React+TS project and 4 feature overlays (Tailwind with edulution theme, API client, OIDC auth, Vitest tests)**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-10T09:43:06Z
- **Completed:** 2026-03-10T09:47:27Z
- **Tasks:** 3
- **Files modified:** 27

## Accomplishments

- Base Vite+React+TS template with package.json, vite.config, tsconfig, index.html, App component, and starter styles
- Tailwind feature overlay with edulution design tokens (19 CSS custom properties for light/dark themes), Tailwind config mapping, Lato font link, and overlay main.tsx/index.html
- API client feature overlay with configured axios instance (withCredentials, VITE_EDU_API_URL env var)
- Auth feature overlay with OIDC AuthProvider (react-oidc-context, WebStorageStateStore, silent renew) and useAuth hook
- Tests feature overlay with Vitest, jsdom, testing-library setup, and sample App.spec.tsx

## Task Commits

Each task was committed atomically:

1. **Task 1: Create base Vite+React+TS template** - `6c0e784` (feat)
2. **Task 2: Create Tailwind and API client feature overlays** - `e160f54` (feat)
3. **Task 3: Create Auth, Tests feature overlays and verify full template set** - `0c930d8` (feat)

## Files Created/Modified

- `cli/templates/custom-app/base/package.json` - Minimal Vite+React+TS dependencies with {{PROJECT_NAME}}
- `cli/templates/custom-app/base/vite.config.ts` - Vite config with React plugin
- `cli/templates/custom-app/base/tsconfig.json` - Project references root config
- `cli/templates/custom-app/base/tsconfig.app.json` - App-specific TS config (bundler resolution, react-jsx)
- `cli/templates/custom-app/base/index.html` - HTML entry with {{PROJECT_NAME}} in title
- `cli/templates/custom-app/base/src/main.tsx` - React root rendering entry point
- `cli/templates/custom-app/base/src/App.tsx` - Starter App component with {{PROJECT_NAME}}
- `cli/templates/custom-app/base/src/App.css` - Minimal centered layout styles
- `cli/templates/custom-app/base/src/vite-env.d.ts` - Vite client type reference
- `cli/templates/custom-app/base/public/vite.svg` - Standard Vite logo SVG
- `cli/templates/custom-app/base/_gitignore` - Standard Vite gitignore (renamed during scaffold)
- `cli/templates/custom-app/features/tailwind/package.json` - Tailwind, PostCSS, Autoprefixer deps
- `cli/templates/custom-app/features/tailwind/tailwind.config.ts` - Edulution color mapping via CSS custom properties
- `cli/templates/custom-app/features/tailwind/postcss.config.js` - PostCSS plugin config
- `cli/templates/custom-app/features/tailwind/src/index.css` - Light/dark theme CSS variables with Tailwind directives
- `cli/templates/custom-app/features/tailwind/src/main.tsx` - Overlay switching CSS import to index.css
- `cli/templates/custom-app/features/tailwind/index.html` - Overlay adding Lato font and light class
- `cli/templates/custom-app/features/api-client/package.json` - Axios dependency
- `cli/templates/custom-app/features/api-client/src/api/apiClient.ts` - Configured axios with withCredentials
- `cli/templates/custom-app/features/api-client/_env.development` - {{EDU_API_URL}} env template
- `cli/templates/custom-app/features/auth/package.json` - react-oidc-context, oidc-client-ts deps
- `cli/templates/custom-app/features/auth/src/auth/AuthProvider.tsx` - OIDC provider with WebStorageStateStore
- `cli/templates/custom-app/features/auth/src/auth/useAuth.ts` - Re-exported auth hook
- `cli/templates/custom-app/features/tests/package.json` - Vitest, jsdom, testing-library deps
- `cli/templates/custom-app/features/tests/vitest.config.ts` - Vitest with jsdom and setup file
- `cli/templates/custom-app/features/tests/src/test/vitest.setup.ts` - jest-dom matcher import
- `cli/templates/custom-app/features/tests/src/test/App.spec.tsx` - Sample test for App component

## Decisions Made

- Used `var(--token)` directly in Tailwind config (not `hsl(var(--token))`) to match edulution-ui hex-based CSS custom properties
- Each feature overlay has isolated package.json fragment with only its own dependencies for clean deep-merging
- Auth overlay excludes axios dependency since api-client overlay is auto-selected when auth is chosen

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Custom-app template set is complete and ready for the scaffold engine (Plan 01) to copy and merge
- Styled-page templates (Plan 03) can reference the same feature overlay patterns
- Template placeholders align with PLACEHOLDER_DEFAULTS from constants.ts

## Self-Check: PASSED

All files verified present. All commits verified in git log.

---

_Phase: 03-cli-scaffolding_
_Completed: 2026-03-10_
