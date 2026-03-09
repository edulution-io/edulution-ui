---
phase: 01-foundation
plan: 02
subsystem: infra
tags: [agents-md, conventions, nestjs, react, tailwind, ui-kit]

requires:
  - phase: 01-foundation-01
    provides: Framework repo with base AGENTS.md, TypeScript layer, directory stubs
provides:
  - edulution-ui project-type AGENTS.md with NestJS, Nx, full-stack conventions
  - custom-app project-type AGENTS.md with Vite+React, ui-kit, own API client
  - styled-page project-type AGENTS.md with Tailwind preset, full branding, CSS variables
affects: [01-03, phase-5]

tech-stack:
  added: []
  patterns: [project-type layer split, Tailwind preset config for styled pages, ui-kit direct import pattern]

key-files:
  created:
    - edulution-ai-framework/edulution-ui/AGENTS.md
    - edulution-ai-framework/custom-app/AGENTS.md
    - edulution-ai-framework/styled-page/AGENTS.md
  modified: []

key-decisions:
  - 'edulution-ui layer at 65 lines covering NestJS, Nx structure, build commands, frontend patterns, testing, license, and pre-commit'
  - 'custom-app layer at 70 lines with simplified flat project structure, direct ui-kit imports, and own axios instance'
  - 'styled-page layer at 73 lines with full Tailwind preset config, branding assets, HTML structure, and minimal JS guidance'
  - 'Removed SH wrapper mention from custom-app to avoid cross-layer content leakage'

patterns-established:
  - 'Project-type layers are self-contained with audience-specific conventions'
  - 'custom-app references typescript layer via @ reference for shared TS conventions'
  - 'Tailwind preset config documented inline in styled-page for copy-paste convenience'

requirements-completed: [CTX-02, CTX-03, CTX-04, CTX-05, CTX-06]

duration: 2min
completed: 2026-03-09
---

# Phase 1 Plan 02: Project-Type Layers Summary

**Three project-type AGENTS.md layers: edulution-ui (NestJS/Nx monorepo), custom-app (Vite+React with ui-kit), and styled-page (Tailwind with edulution branding preset)**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-09T13:12:34Z
- **Completed:** 2026-03-09T13:14:58Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- edulution-ui/AGENTS.md with NestJS conventions, Nx structure, build commands, eduApi/Zustand patterns, SH wrappers, license header, and pre-commit checks
- custom-app/AGENTS.md with Vite+React stack, ui-kit direct imports (no SH wrappers), own axios API client, simplified project structure, and linting config
- styled-page/AGENTS.md with complete Tailwind preset config mapping CSS variables to color names, full branding (Lato font, logo, favicon, brand colors), HTML structure, and minimal JS guidance

## Task Commits

Each task was committed atomically:

1. **Task 1: Create edulution-ui project-type layer** - `160d3ff` (feat)
2. **Task 2: Create custom-app and styled-page project-type layers** - `5fe84e3` (feat)

## Files Created/Modified

- `edulution-ai-framework/edulution-ui/AGENTS.md` - Core monorepo conventions: NestJS, Nx, build commands, frontend patterns, testing, license (65 lines)
- `edulution-ai-framework/custom-app/AGENTS.md` - Custom React app conventions: Vite+React, ui-kit imports, own axios client, simplified structure (70 lines)
- `edulution-ai-framework/styled-page/AGENTS.md` - Styled page conventions: Tailwind preset, full branding, CSS variables, HTML structure, minimal JS (73 lines)

## Decisions Made

- edulution-ui layer focuses exclusively on core monorepo patterns (NestJS, Nx, eduApi, SH wrappers) without duplicating TypeScript or base layer content
- custom-app layer avoids mentioning the SH wrapper pattern entirely (not even as "do not use") to prevent cross-layer content leakage
- custom-app recommends its own axios instance rather than reusing eduApi, following research recommendation
- styled-page includes the full Tailwind preset config inline for copy-paste convenience rather than referencing an external file
- All three layers stayed well under the 150-line limit (65, 70, 73 lines respectively)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed SH wrapper mention from custom-app layer**

- **Found during:** Task 2 (verification step)
- **Issue:** The plan said "Do NOT recreate the SH wrapper pattern" which introduced the term "SH wrapper" into custom-app -- verification criteria require SH wrapper to appear ONLY in edulution-ui
- **Fix:** Rephrased to "Use ui-kit exports directly as-is -- do not wrap them in additional component layers"
- **Files modified:** edulution-ai-framework/custom-app/AGENTS.md
- **Verification:** grep confirms no "SH wrapper" in custom-app
- **Committed in:** 5fe84e3 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor wording fix to satisfy verification criteria. No scope creep.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All five AGENTS.md files now exist in the framework repo (root, typescript, edulution-ui, custom-app, styled-page)
- Layered convention system is complete: each project type has focused, audience-specific conventions
- Directory stubs ready for Plan 03 (integration guide and composite GitHub Action)
- All files well under 150-line limit with room for future additions

---

_Phase: 01-foundation_
_Completed: 2026-03-09_
