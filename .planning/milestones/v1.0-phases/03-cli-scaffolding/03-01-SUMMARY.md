---
phase: 03-cli-scaffolding
plan: 01
subsystem: cli
tags: [typescript, tsup, inquirer, deepmerge, picocolors, cli, scaffolding, esm]

requires:
  - phase: 01-foundation
    provides: AGENTS.md layers, directory structure, framework repo
provides:
  - CLI package structure (package.json, tsup, tsconfig)
  - Type system (ProjectType, Feature, UiKitMode, ScaffoldConfig)
  - Constants (FEATURES_LIST, RENAME_MAP, TEXT_EXTENSIONS, PLACEHOLDER_DEFAULTS)
  - Interactive prompt flow (runPrompts)
  - 8-phase scaffold engine (scaffold)
  - Post-scaffold automation (postScaffold with git init, submodule, npm install)
  - CLI entry point wiring prompts -> scaffold -> postScaffold
affects: [03-02, 03-03, 04-templates, 05-docs]

tech-stack:
  added: ['@inquirer/prompts ^7', 'deepmerge ^4', 'picocolors ^1', 'tsup ^8']
  patterns:
    [
      'ESM CLI with shebang banner via tsup',
      'deepmerge with overwriteArrayMerge for package.json',
      '8-phase scaffold pipeline',
      '_prefix file rename convention',
      'template placeholder replacement',
    ]

key-files:
  created:
    - edulution-ai-framework/cli/package.json
    - edulution-ai-framework/cli/tsup.config.ts
    - edulution-ai-framework/cli/tsconfig.json
    - edulution-ai-framework/cli/src/types.ts
    - edulution-ai-framework/cli/src/constants.ts
    - edulution-ai-framework/cli/src/prompts.ts
    - edulution-ai-framework/cli/src/scaffold.ts
    - edulution-ai-framework/cli/src/post-scaffold.ts
    - edulution-ai-framework/cli/src/index.ts
    - edulution-ai-framework/.gitignore
  modified: []

key-decisions:
  - 'Default exports used for all module files following project convention'
  - 'tsup outExtension set to .mjs to match package.json bin field'
  - 'Nested npm install strategy used to avoid Nx workspace interference'
  - 'Post-scaffold submodule add uses SSH with HTTPS fallback on failure'

patterns-established:
  - 'CLI module pattern: default export per file, .js extensions in ESM imports'
  - 'Scaffold pipeline: 8 phases (resolve, copy, overlay, merge, ui-kit, rename, replace, generate)'
  - 'Feature overlay: skip package.json during file copy, deep-merge separately'
  - 'Placeholder replacement: whitelist text extensions, skip binary files'

requirements-completed: [CLI-01, CLI-04]

duration: 6min
completed: 2026-03-10
---

# Phase 3 Plan 01: CLI Package Structure Summary

**Interactive CLI framework with prompt flow, 8-phase scaffold engine, and post-scaffold git/npm automation using tsup ESM bundling**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-10T09:31:27Z
- **Completed:** 2026-03-10T09:37:39Z
- **Tasks:** 3
- **Files modified:** 10

## Accomplishments

- CLI package at edulution-ai-framework/cli/ with valid package.json, tsup ESM build producing dist/index.mjs with shebang
- Type system with ProjectType, Feature, UiKitMode, ScaffoldConfig and const objects replacing enums
- Interactive prompt flow collecting project type, name, features (auth auto-includes api-client, tests excluded for styled pages), ui-kit mode with local path validation
- 8-phase scaffold engine: resolve templates, copy base, overlay features, deep-merge package.json, wire ui-kit (npm/local), rename \_prefix files, replace placeholders, generate CLAUDE.md/AGENTS.md
- Post-scaffold automation: git init, submodule add with SSH/HTTPS fallback, npm install prompt, initial commit, formatted feature checklist summary

## Task Commits

Each task was committed atomically:

1. **Task 1: Create CLI package structure with types, constants, and build config** - `43054fd` (feat)
2. **Task 2: Implement interactive prompt flow and scaffold engine** - `7a534a7` (feat)
3. **Task 3: Implement post-scaffold automation and CLI entry point** - `c63d3e8` (feat)

## Files Created/Modified

- `edulution-ai-framework/cli/package.json` - npm package config with bin, files, dependencies, scripts
- `edulution-ai-framework/cli/tsup.config.ts` - ESM build config with shebang banner and .mjs output
- `edulution-ai-framework/cli/tsconfig.json` - TypeScript config targeting ES2022/Node16
- `edulution-ai-framework/cli/src/types.ts` - ProjectType, Feature, UiKitMode, ScaffoldConfig type definitions
- `edulution-ai-framework/cli/src/constants.ts` - FEATURES_LIST, RENAME_MAP, TEXT_EXTENSIONS, PLACEHOLDER_DEFAULTS, FRAMEWORK_REPO_URL
- `edulution-ai-framework/cli/src/prompts.ts` - Interactive prompt flow with validation and dependency logic
- `edulution-ai-framework/cli/src/scaffold.ts` - 8-phase scaffold engine with template composition
- `edulution-ai-framework/cli/src/post-scaffold.ts` - Git init, submodule, npm install, commit, summary
- `edulution-ai-framework/cli/src/index.ts` - CLI entry point wiring prompts -> scaffold -> postScaffold
- `edulution-ai-framework/.gitignore` - Ignore cli/node_modules/ and cli/dist/

## Decisions Made

- Used default exports for all module files, following the project convention (CLAUDE.md: "Prefer default exports over named exports")
- Added outExtension config to tsup to produce .mjs files, since with "type": "module" in package.json tsup defaults to .js
- Used nested npm install strategy (--install-strategy=nested) to prevent the Nx workspace from stripping the CLI package.json
- Post-scaffold submodule add uses SSH URL as default with try/catch fallback suggesting HTTPS alternative

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed tsup output extension mismatch**

- **Found during:** Task 3 (CLI entry point and build)
- **Issue:** tsup produced dist/index.js instead of dist/index.mjs; package.json bin field expects ./dist/index.mjs
- **Fix:** Added `outExtension: () => ({ js: '.mjs' })` to tsup.config.ts
- **Files modified:** edulution-ai-framework/cli/tsup.config.ts
- **Verification:** tsup build produces dist/index.mjs with shebang
- **Committed in:** c63d3e8 (Task 3 commit)

**2. [Rule 3 - Blocking] Added .gitignore to framework repo**

- **Found during:** Task 1 (package structure)
- **Issue:** cli/node_modules/ and cli/dist/ would be committed without gitignore
- **Fix:** Created .gitignore with cli/node_modules/ and cli/dist/ entries
- **Files modified:** edulution-ai-framework/.gitignore
- **Verification:** git status no longer shows node_modules
- **Committed in:** 43054fd (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes necessary for correct build output and clean git state. No scope creep.

## Issues Encountered

- Nx workspace linter stripped CLI package.json on first npm install attempt; resolved by using --install-strategy=nested flag

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- CLI package compiles and builds successfully, ready for template content (Plan 02, 03)
- Templates directory structure needed at edulution-ai-framework/cli/templates/ for scaffold engine to find base/feature directories
- All source files have correct ESM imports with .js extensions

## Self-Check: PASSED

- All 10 files: FOUND
- All 3 commits: FOUND (43054fd, 7a534a7, c63d3e8)

---

_Phase: 03-cli-scaffolding_
_Completed: 2026-03-10_
