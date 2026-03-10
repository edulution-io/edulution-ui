# Project Retrospective

_A living document updated after each milestone. Lessons feed forward into future planning._

## Milestone: v1.0 — edulution AI Framework MVP

**Shipped:** 2026-03-10
**Phases:** 5 | **Plans:** 11 | **Commits:** 89

### What Was Built

- Layered AGENTS.md content system (base + TypeScript + 3 project-type layers)
- CI sync pipeline for swagger spec and Tailwind artifacts
- Interactive CLI scaffolder with feature overlays (Tailwind, API client, auth, tests)
- AI workflow guides (new-app, add-feature) wired into scaffold output
- Dog-fooding: edulution-ui consumes framework as submodule

### What Worked

- Wave-based plan parallelization in Phase 3 (4 plans executed efficiently)
- Research-before-plan workflow prevented false starts
- AGENTS.md layering via filesystem inheritance was simpler than expected
- CLI feature overlay architecture (isolated package.json fragments) scaled cleanly

### What Was Inefficient

- ROADMAP.md checkboxes for phases 3 and 4 were not updated during execution (stale progress table)
- SYNC-04 (drift detection) was deferred without a clear tracking mechanism
- Performance metrics in STATE.md only captured phases 1-2 accurately; later phases used different format

### Patterns Established

- Describe-and-generate pattern for workflow docs (no code snippets, prevents convention drift)
- SSH-first with HTTPS fallback for submodule URLs
- ESM module type for all new Node.js packages
- Feature overlays with isolated dependency fragments for clean merging

### Key Lessons

1. ROADMAP.md must be updated atomically with plan completion — stale checkboxes create confusion during milestone completion
2. Deferred requirements (like SYNC-04) need explicit tracking in STATE.md blockers section, not just a parenthetical in plan names
3. Dog-fooding phase was trivially simple because all conventions were already in the framework — validates the layered approach

### Cost Observations

- Model mix: primarily quality profile (opus)
- Sessions: ~10 sessions over 12 days
- Notable: Phases 3-5 executed significantly faster than phases 1-2 as patterns were established

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Commits | Phases | Key Change                                                 |
| --------- | ------- | ------ | ---------------------------------------------------------- |
| v1.0      | 89      | 5      | Initial milestone; established research-plan-execute cycle |

### Top Lessons (Verified Across Milestones)

1. (First milestone — lessons to be verified in v1.1+)
