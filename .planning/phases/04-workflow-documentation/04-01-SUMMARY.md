---
phase: 04-workflow-documentation
plan: 01
subsystem: docs
tags: [markdown, ai-workflow, guides, orientation, feature-building]

requires:
  - phase: 01-foundation
    provides: AGENTS.md convention layers referenced by both guides
  - phase: 03-cli-scaffolding
    provides: scaffold templates that new-app guide walks through
provides:
  - AI workflow guide for new project orientation (new-app.md)
  - AI workflow guide for adding features (add-feature.md)
affects: [04-02-scaffold-integration, 05-dogfooding]

tech-stack:
  added: []
  patterns: [step-format-blocks, auto-detection-before-asking, describe-and-generate]

key-files:
  created:
    - edulution-ai-framework/docs/workflows/new-app.md
    - edulution-ai-framework/docs/workflows/add-feature.md
  modified: []

key-decisions:
  - 'Step format uses Read/Ask/Do not/Check blocks per CONTEXT.md approved pattern'
  - 'No code snippets in guides -- describe-and-generate pattern prevents convention drift'
  - 'Feature auto-detection from file existence rather than asking users what was scaffolded'
  - 'ui-kit TODO markers use both HTML comment and JS comment formats for discoverability'

patterns-established:
  - 'Step format: Read/Ask the user/Do not/Check blocks for AI workflow guides'
  - 'Auto-detection: check file existence to determine features rather than prompting users'
  - 'Convention re-read: explicit Read directive for AGENTS.md before each code generation step'

requirements-completed: [WKFL-01, WKFL-02, WKFL-03]

duration: 3min
completed: 2026-03-10
---

# Phase 4 Plan 1: Workflow Guides Summary

**Two AI-consumable workflow guides (new-app.md at 144 lines, add-feature.md at 183 lines) with step-format blocks, auto-detection patterns, and ui-kit TODO markers**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-10T10:59:01Z
- **Completed:** 2026-03-10T11:02:01Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- new-app.md: 5-step orientation guide with file-by-file walkthrough for both project types
- add-feature.md: 4-step feature guide with 3 branching flows (page/route, API integration, page section)
- Both guides use consistent Ask/Do not/Check block format for AI consumption
- Feature auto-detection from filesystem prevents unnecessary user prompts
- ui-kit TODO marker instructions integrated into all code generation steps

## Task Commits

Each task was committed atomically:

1. **Task 1: Write new-app.md workflow guide** - `9a79ffc` (feat)
2. **Task 2: Write add-feature.md workflow guide** - `4d9c674` (feat)

## Files Created/Modified

- `edulution-ai-framework/docs/workflows/new-app.md` - AI orientation guide for newly scaffolded edulution projects (144 lines)
- `edulution-ai-framework/docs/workflows/add-feature.md` - AI guide for adding pages, API integrations, and styled sections (183 lines)

## Decisions Made

- Step format uses Read/Ask/Do not/Check blocks per CONTEXT.md approved pattern
- No code snippets in guides -- describe-and-generate pattern prevents convention drift between guides and AGENTS.md
- Feature auto-detection from file existence (e.g., check for `src/api/apiClient.ts`) rather than asking users what was scaffolded
- ui-kit TODO markers use both HTML comment (`<!-- TODO: @ui-kit/ComponentName -->`) and JS comment (`// TODO: Replace with @edulution-io/ui-kit`) formats

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Both workflow guides are complete and ready for scaffold engine integration (Plan 04-02)
- Plan 04-02 will update scaffold.ts to inject workflow references into generated AGENTS.md
- Plan 04-02 will also update integration-guide.md and README.md for human discovery

## Self-Check: PASSED

- [x] edulution-ai-framework/docs/workflows/new-app.md exists
- [x] edulution-ai-framework/docs/workflows/add-feature.md exists
- [x] 04-01-SUMMARY.md exists
- [x] Commit 9a79ffc found in submodule history
- [x] Commit 4d9c674 found in submodule history

---

_Phase: 04-workflow-documentation_
_Completed: 2026-03-10_
