# Phase 3: CLI Scaffolding - Context

**Gathered:** 2026-03-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Interactive CLI that generates ready-to-run edulution-compatible projects. A developer runs `npx edulution-create`, selects project type and features, and gets a working project with edulution styling, framework submodule, and AI conventions wired up. Two project types: custom React app (Vite+React+TS) and styled HTML page.

</domain>

<decisions>
## Implementation Decisions

### CLI invocation

- Published as npm package, invoked via `npx edulution-create`
- CLI source, templates, and package all live in the edulution-ai-framework repo
- Written in TypeScript, compiled to JS for distribution
- Uses `@inquirer/prompts` for interactive prompts (select, checkbox, input, confirm)

### Prompt flow

- Project type first: Custom React App or Styled HTML Page
- Project name second (creates `./{name}/` in current working directory)
- Feature selection: all features are optional checkboxes for both project types (except tests not available for styled pages)
- Features: Tailwind + edulution theme, API client (axios/eduApi), Auth (SSO/OIDC), Test framework (Vitest)
- Dependency: selecting Auth auto-selects API client (greyed out) since SSO needs the backend connection
- ui-kit prompt only for custom React apps: npm package vs local checkout
- When local checkout selected: prompt for path, validate it exists and contains @edulution-io/ui-kit, warn if not found but allow proceeding

### Template strategy

- Static file copy + variable injection (real files with `{{PLACEHOLDER}}` replacement)
- Base directory always copied, feature directories copied when selected
- Deep merge for shared files (e.g., package.json): base has minimal deps, each feature adds its own fragment, CLI deep-merges them
- Templates organized as `templates/{project-type}/base/` and `templates/{project-type}/features/{feature}/`

### Auto-generated AI conventions

- CLI generates both CLAUDE.md and AGENTS.md in the scaffolded project
- AGENTS.md references the framework's base + project-type layer via `@edulution-ai-framework/...` paths
- AI tools can immediately discover edulution conventions

### Post-scaffold behavior

- Auto git init + auto add edulution-ai-framework as submodule
- Ask user whether to run `npm install` (confirm prompt, default yes)
- Auto create initial commit: `chore: scaffold {name} with edulution-create`
- Show feature checklist summary (included/not selected) + next steps (`cd {name}`, `npm run dev`)

### ui-kit integration

- Prompt only appears for custom React apps (styled pages use Tailwind tokens from framework artifacts/)
- Two modes: npm package (`@edulution-io/ui-kit: ^1.0.0`) or local checkout (`file:../path`)
- Local checkout: validate path exists, warn if not found, wire both package.json file: reference AND tsconfig.json paths alias

### Claude's Discretion

- Exact placeholder syntax and merge implementation details
- How to handle styled page feature combinations (API client without React)
- npm package name and scope for the CLI
- Exact file structure within each template
- How to bundle/compile the TypeScript CLI for npm distribution

</decisions>

<specifics>
## Specific Ideas

- User wants same feature options for both project types (except tests excluded from styled pages) for consistency
- Feature checklist summary post-scaffold should show both selected and unselected features for clarity
- Initial git commit message format: `chore: scaffold {name} with edulution-create`
- Local ui-kit path validation: warn but don't block, user can fix in package.json later

</specifics>

<code_context>

## Existing Code Insights

### Reusable Assets

- `edulution-ai-framework/` repo: already has AGENTS.md layers (base, typescript, custom-app, styled-page, edulution-ui)
- `edulution-ai-framework/.github/actions/`: composite action for submodule CI auth (consumers reference this)
- `edulution-ai-framework/docs/integration-guide.md`: documents submodule setup pattern
- `apps/frontend/tailwind.config.ts`, `libs/ui-kit/tailwind.config.ts`, `apps/frontend/src/index.scss`: source for Tailwind template content (also synced to framework artifacts/)
- `apps/frontend/src/api/eduApi.ts`: pattern for API client template
- OIDC auth flow (`react-oidc-context` + `oidc-client-ts` + `keycloak-js`): pattern for auth template

### Established Patterns

- AGENTS.md spec filesystem inheritance for convention discovery
- CLAUDE.md as pointer (`@AGENTS.md`): used in edulution-ui, same pattern for scaffolded projects
- `@edulution-io/ui-kit` package with `cn()`, Button, and other primitives
- Custom apps import from ui-kit directly, no SH wrapper pattern (Phase 1 decision)

### Integration Points

- CLI package lives in edulution-ai-framework repo (adds bin, src, templates directories + package.json changes)
- Published to npm registry for `npx` invocation
- Scaffolded projects reference private framework repo as submodule (needs GitHub access)
- Framework artifacts/ directory provides synced Tailwind configs and swagger spec (Phase 2)

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 03-cli-scaffolding_
_Context gathered: 2026-03-09_
