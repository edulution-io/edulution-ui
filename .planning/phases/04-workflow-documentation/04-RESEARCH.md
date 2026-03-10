# Phase 4: Workflow Documentation - Research

**Researched:** 2026-03-10
**Domain:** AI-consumable workflow documentation (Markdown guides for AI coding assistants)
**Confidence:** HIGH

## Summary

Phase 4 creates two markdown workflow guides (`docs/workflows/new-app.md` and `docs/workflows/add-feature.md`) that any AI coding tool can follow step-by-step to help developers build edulution-compatible projects. The guides live in the framework repo alongside existing docs. The CLI scaffold engine (`cli/src/scaffold.ts`) must be updated to inject workflow references into the generated AGENTS.md file, and the integration guide and README need brief additions for human discovery.

This phase is primarily a documentation authoring task with a small code change (scaffold.ts update). The research focuses on: (1) the exact structure of each guide based on CONTEXT.md decisions, (2) the step format that was approved during discussion, (3) what the guides must reference from the existing codebase, and (4) the scaffold engine modification needed. There are no external libraries to install -- this is pure markdown authoring plus a minor TypeScript edit.

**Primary recommendation:** Write both guides using the agreed step format (Read/Ask/Do not/Check blocks), keep each under 250 lines, reference AGENTS.md layers by name at each step rather than duplicating conventions, and use `<!-- TODO: @ui-kit/ComponentName -->` markers wherever ui-kit components would be appropriate.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- Linear step-by-step numbered flow, inline branches for project type differences ("If React app: ... If styled page: ...")
- One file per guide: `docs/workflows/new-app.md` and `docs/workflows/add-feature.md`
- Relaxed line limit (~250 lines) since workflow guides are read-once instructions, not persistent context like AGENTS.md
- No code snippets inline -- describe what to create, let AI generate code following AGENTS.md conventions
- Per-step guardrails ("Do not...") to prevent common AI mistakes at each step
- New-app guide assumes project already scaffolded via `npx edulution-create` (prerequisite, not duplicated)
- New-app Step 1: Verify project runs (`npm install && npm run dev`)
- New-app Step 2: File-by-file walkthrough explaining each key file's purpose (App.tsx, apiClient, AuthProvider, tailwind.config, AGENTS.md)
- No first feature built in new-app guide -- orientation only, then hand off to add-feature guide
- Suggest commit at verification milestone
- Exact question templates with suggested options at every decision point
- AI must always force a choice -- no "you decide" option for users (all decisions require explicit user input)
- AI reads project files to auto-detect scaffolded features rather than asking user what was selected
- Guide tells AI to re-read relevant AGENTS.md layer before generating code at each step
- Suggest git commits at logical milestones (not forced, not after every step)
- Placeholder TODO markers for ui-kit components: `<!-- TODO: @ui-kit/Sidebar -->`
- Generated code includes `// TODO: Replace with @edulution-io/ui-kit` comments
- When ui-kit grows, guides and templates updated in the same commit
- Add-feature: Single guide file with AI auto-detecting feature type from user's request
- Add-feature: Three feature flows: new page/route (React), API integration, styled page section
- Add-feature: API integration flow always checks `artifacts/swagger-spec.json` first
- Add-feature: TypeScript types derived from swagger spec -- no `any` or untyped responses
- Add-feature: Styled page sections focus on HTML+Tailwind+edulution tokens
- Add-feature: Verification step at end: run dev server, visually confirm, suggest commit
- Guides live in `edulution-ai-framework/docs/workflows/` alongside existing `docs/integration-guide.md`
- CLI scaffold engine updated to add Workflows section to generated AGENTS.md with `@` references
- Framework README.md gets a brief Workflow Guides section
- Integration guide updated with section for existing projects to manually add workflow references
- No version markers in guide files -- git submodule commit IS the version
- Templates, conventions, and guides updated atomically in the same commit

### Claude's Discretion

None explicitly stated -- all major decisions were locked during the context session.

### Deferred Ideas (OUT OF SCOPE)

None -- discussion stayed within phase scope.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID      | Description                                                                          | Research Support                                                                                                                                                     |
| ------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| WKFL-01 | "New app" guide walks AI through creating a complete custom app from scratch         | New-app guide structure researched: 2-step orientation flow (verify + walkthrough), references scaffold prerequisite, covers both project types with inline branches |
| WKFL-02 | "Add feature" guide walks AI through adding a page/feature to existing app           | Add-feature guide structure researched: 3 feature flows (page/route, API integration, styled section), auto-detection pattern, swagger-first API typing              |
| WKFL-03 | Guides instruct AI to prompt user for clarification at decision points               | Decision point format researched: exact question templates with options, forced choices (no defaults), auto-detection of existing features from project files        |
| WKFL-04 | Guides reference setup script as prerequisite and explain when to use which .md file | Discovery mechanism researched: scaffold engine AGENTS.md update, integration guide section, README section, `@` reference pattern                                   |

</phase_requirements>

## Standard Stack

### Core

This phase has no library dependencies. It produces markdown files and a minor TypeScript edit.

| Artifact             | Format            | Purpose                                       | Location                        |
| -------------------- | ----------------- | --------------------------------------------- | ------------------------------- |
| new-app.md           | Markdown          | AI workflow guide for new project orientation | `docs/workflows/new-app.md`     |
| add-feature.md       | Markdown          | AI workflow guide for adding features         | `docs/workflows/add-feature.md` |
| scaffold.ts          | TypeScript (edit) | Generate AGENTS.md with workflow references   | `cli/src/scaffold.ts`           |
| integration-guide.md | Markdown (edit)   | Add workflow reference section                | `docs/integration-guide.md`     |
| README.md            | Markdown (edit)   | Add workflow guides section                   | `README.md`                     |

### Supporting

No additional libraries needed. The guides are pure markdown. The scaffold.ts edit is a string change to the AGENTS.md template.

## Architecture Patterns

### Recommended File Structure

```
docs/
  integration-guide.md        # Existing (edit: add workflow section)
  workflows/
    new-app.md                 # NEW: AI guide for new project orientation
    add-feature.md             # NEW: AI guide for adding features
```

### Pattern 1: Step Format (Approved During Discussion)

**What:** Each step in a workflow guide uses a consistent block format with Read/Ask/Do not/Check sections.

**When to use:** Every numbered step in both guides.

**Example structure:**

```markdown
## Step N: [Step Name]

**Read:** [Files the AI should read before this step]

**Ask the user:**

> [Exact question with options]
>
> - Option A: [description]
> - Option B: [description]

**Do not:**

- [Guardrail preventing common AI mistake]

**Check:**

- [ ] [Verification item]
```

Not every step requires all four blocks. Some steps have no "Ask the user" (orientation steps). Some have no "Do not" (simple verification steps). The blocks present should follow this order consistently.

### Pattern 2: Auto-Detection Before Asking

**What:** Before asking the user about project configuration, the AI reads project files to auto-detect what was scaffolded.

**When to use:** When the guide needs to know which features are present.

**Example instruction in guide:**

```markdown
**Read:** `package.json`, `src/` directory listing

Detect which features are present:

- If `src/api/apiClient.ts` exists -> API client is configured
- If `src/auth/AuthProvider.tsx` exists -> Auth is configured
- If `tailwind.config.ts` exists -> Tailwind is configured
- If `vitest.config.ts` exists -> Tests are configured
```

### Pattern 3: AGENTS.md Re-Read Directive

**What:** Each step that generates code tells the AI to re-read the relevant AGENTS.md layer first.

**When to use:** Before any code generation step.

**Example:**

```markdown
**Read:** `edulution-ai-framework/custom-app/AGENTS.md` (re-read conventions before generating code)
```

This prevents convention drift as the AI's context grows during a long workflow session.

### Pattern 4: Inline Project Type Branching

**What:** Rather than separate guides per project type, use inline conditional branches.

**When to use:** When a step differs between custom-app and styled-page project types.

**Example:**

```markdown
**If custom-app:**

- Create `src/pages/Dashboard.tsx` as a React component
- Add route in App.tsx

**If styled-page:**

- Add a new `<section>` in `index.html`
- Style with Tailwind utility classes
```

### Pattern 5: ui-kit TODO Markers

**What:** Both guides and generated code include visible placeholder markers for ui-kit components.

**When to use:** Wherever the guide instructs creation of UI elements that will eventually use ui-kit.

**Two marker formats:**

```markdown
<!-- TODO: @ui-kit/Button — replace with ui-kit Button component when available -->
```

```typescript
// TODO: Replace with @edulution-io/ui-kit Button component
const Button = ({ children, ...props }) => (
  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md" {...props}>
    {children}
  </button>
);
```

### Anti-Patterns to Avoid

- **Duplicating AGENTS.md content in guides:** Guides should reference AGENTS.md, not copy conventions inline. This prevents drift.
- **Embedding code snippets in guides:** The CONTEXT.md decision explicitly prohibits this. Describe what to create and let the AI generate code following conventions.
- **Assuming AI remembers earlier steps:** Each step should include its own Read directives. AI context windows vary; explicit re-reads are cheap insurance.
- **Making decisions for the user:** The user decided that all decision points must present exact question templates with options. No "you decide" or default choices.

## Don't Hand-Roll

| Problem                | Don't Build                | Use Instead                                             | Why                                                                                                              |
| ---------------------- | -------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Detecting project type | Manual file-by-file checks | Read `AGENTS.md` `@` reference path                     | The `@` reference in the project's AGENTS.md already declares the project type (`custom-app/` or `styled-page/`) |
| Detecting features     | Asking the user            | Read `package.json` dependencies + check file existence | Scaffold engine already created these files; detection is deterministic                                          |
| API type generation    | Manual type definitions    | Read `artifacts/swagger-spec.json`                      | Swagger spec is the source of truth; types should be derived from response shapes                                |
| Tailwind config        | Writing from scratch       | Reference existing `tailwind.config.ts` in project      | Scaffold already generated the full config with edulution tokens                                                 |

## Common Pitfalls

### Pitfall 1: Guide Exceeds Line Limit

**What goes wrong:** Workflow guides balloon past 250 lines, degrading AI comprehension.
**Why it happens:** Each step gets verbose with examples, alternatives, and edge cases.
**How to avoid:** No inline code snippets (decided in CONTEXT.md). Describe what to create. Reference AGENTS.md for conventions. Keep each step to 10-15 lines max.
**Warning signs:** Guide file hits 200 lines before covering all steps.

### Pitfall 2: Convention Drift Between Guide and AGENTS.md

**What goes wrong:** Guide instructs one pattern (e.g., named exports) while AGENTS.md says another (default exports).
**Why it happens:** Guide authors don't cross-check AGENTS.md content.
**How to avoid:** Guide says "Read AGENTS.md" not "Do it this way." All coding conventions stay in AGENTS.md, never in guides.
**Warning signs:** Guide contains coding style instructions instead of references to convention files.

### Pitfall 3: Scaffold Engine String Not Updated

**What goes wrong:** Generated AGENTS.md in new projects has no reference to workflow guides, making them undiscoverable.
**Why it happens:** The scaffold.ts edit is easy to forget since it's a small string change alongside large documentation work.
**How to avoid:** Treat the scaffold.ts update as a first-class task, not an afterthought. Test by running `npx edulution-create` after the change.
**Warning signs:** Generated AGENTS.md file doesn't contain `@edulution-ai-framework/docs/workflows/` references.

### Pitfall 4: Ambiguous Decision Points

**What goes wrong:** AI interprets a vague question as optional and makes its own choice.
**Why it happens:** Decision point phrasing allows wiggle room.
**How to avoid:** Use exact question templates with enumerated options. Each option must be concrete (not "other" or "your choice"). Always use "Ask the user:" block formatting.
**Warning signs:** Guide step says "decide" or "choose" without structured options.

### Pitfall 5: Missing Verification Steps

**What goes wrong:** AI completes guide without verifying the project works.
**Why it happens:** Guides focus on creation steps and skip validation.
**How to avoid:** Every guide must end with a verification step (run dev server, check for errors). Intermediate commit suggestions at logical milestones.
**Warning signs:** No "Check:" blocks in the final steps.

### Pitfall 6: Styled Page Guide Assumes React

**What goes wrong:** Guide instructions reference React patterns (components, hooks, JSX) when the project is a styled page (vanilla HTML/JS).
**Why it happens:** Guide author is React-focused and forgets the styled-page flow uses different technology.
**How to avoid:** Every instruction must be branched with "If custom-app" / "If styled-page" when the technology differs. The styled-page flow uses vanilla JS, native fetch, and direct DOM manipulation.
**Warning signs:** Instructions reference `import`, `useState`, or `tsx` files without checking project type.

## Code Examples

### Scaffold Engine Update (scaffold.ts lines 184-189)

The current AGENTS.md generation in `scaffold.ts`:

```typescript
// Current (Phase 8 in scaffold.ts)
const claudeMd = '@edulution-ai-framework/AGENTS.md\n';
const agentsMd = `@edulution-ai-framework/${config.projectType}/AGENTS.md\n`;
```

Must be updated to include workflow references:

```typescript
// Updated
const claudeMd = '@edulution-ai-framework/AGENTS.md\n';
const agentsMd = [
  `@edulution-ai-framework/${config.projectType}/AGENTS.md`,
  '',
  '## Workflows',
  '',
  'Follow these guides when building features:',
  '- New project orientation: @edulution-ai-framework/docs/workflows/new-app.md',
  '- Add a feature: @edulution-ai-framework/docs/workflows/add-feature.md',
  '',
].join('\n');
```

### New-App Guide Skeleton (Key Files to Walk Through)

Based on the scaffolded custom-app template structure:

| File                        | Purpose to Explain                                                |
| --------------------------- | ----------------------------------------------------------------- |
| `src/App.tsx`               | Entry component, where routes and layout go                       |
| `src/main.tsx`              | React root mount, StrictMode, provider wrapping                   |
| `src/api/apiClient.ts`      | Pre-configured axios instance (if api-client feature)             |
| `src/auth/AuthProvider.tsx` | OIDC auth wrapper (if auth feature)                               |
| `src/auth/useAuth.ts`       | Auth hook re-export (if auth feature)                             |
| `tailwind.config.ts`        | edulution theme tokens mapped to Tailwind (if tailwind feature)   |
| `src/index.css`             | CSS custom properties for light/dark themes (if tailwind feature) |
| `AGENTS.md`                 | AI convention file -- references framework layer                  |
| `CLAUDE.md`                 | Claude-specific pointer to AGENTS.md                              |
| `package.json`              | Dependencies, scripts, project metadata                           |

For styled-page projects, the walkthrough covers:

| File                 | Purpose to Explain                                 |
| -------------------- | -------------------------------------------------- |
| `index.html`         | Entry point, Lato font, Tailwind CSS link          |
| `src/styles.css`     | Tailwind directives + CSS custom properties        |
| `src/theme.css`      | Full light/dark theme tokens (if tailwind feature) |
| `src/api.js`         | Native fetch wrapper (if api-client feature)       |
| `src/auth.js`        | OIDC UserManager direct usage (if auth feature)    |
| `tailwind.config.js` | edulution Tailwind preset (always present)         |
| `AGENTS.md`          | AI convention file                                 |
| `CLAUDE.md`          | Claude-specific pointer                            |

### Add-Feature Auto-Detection Logic

Guide should instruct the AI to detect the project type and available features:

```markdown
**Read:** `AGENTS.md` in project root

Determine project type from the `@` reference:

- Contains `custom-app/AGENTS.md` -> This is a React custom app
- Contains `styled-page/AGENTS.md` -> This is a styled HTML page

**Read:** `package.json`, list `src/` directory

Detect available features:

- `src/api/apiClient.ts` or `src/api.js` exists -> API client available
- `src/auth/` directory or `src/auth.js` exists -> Auth configured
- `tailwind.config.ts` or `tailwind.config.js` exists -> Tailwind active
- `artifacts/swagger-spec.json` exists -> Swagger spec available for type generation
```

### Add-Feature Decision Point Template

```markdown
**Ask the user:**

> What type of feature are you adding?
>
> 1. **New page/route** - A new page with its own URL path (React apps only)
> 2. **API integration** - Connect to an edulution API endpoint and display/use the data
> 3. **Page section** - Add a new section to an existing page (HTML content + styling)
```

## State of the Art

| Old Approach                        | Current Approach                      | When Changed | Impact                                                             |
| ----------------------------------- | ------------------------------------- | ------------ | ------------------------------------------------------------------ |
| Tool-specific config (.cursorrules) | AGENTS.md universal format            | 2025         | AI-agnostic guides work with any tool                              |
| Verbose multi-file specs            | Single-file linear workflows          | 2025-2026    | AI follows simpler linear flows more reliably                      |
| AI makes assumptions                | Explicit decision points with options | 2025-2026    | User stays in control, fewer rewrites                              |
| Code examples in guides             | Describe-and-generate pattern         | 2025-2026    | AI generates code matching current conventions, not stale examples |

## Open Questions

1. **Swagger spec location in consumer projects**
   - What we know: CI syncs swagger-spec.json to the framework repo as an artifact
   - What's unclear: In a scaffolded consumer project, the path is `edulution-ai-framework/artifacts/swagger-spec.json` via the submodule. The add-feature guide needs to use this exact path.
   - Recommendation: Use `edulution-ai-framework/artifacts/swagger-spec.json` as the path in the guide. Verify this path exists in the framework repo.

2. **How many ui-kit TODO markers to include**
   - What we know: User emphasized TODOs are crucial for driving ui-kit adoption
   - What's unclear: The exact list of components that will eventually exist in ui-kit
   - Recommendation: Use generic markers for common UI patterns (Button, Input, Card, Sidebar, Modal) based on what edulution-ui already has. The guides should mention TODOs but not try to enumerate every possible component.

## Validation Architecture

### Test Framework

| Property           | Value                                                                |
| ------------------ | -------------------------------------------------------------------- |
| Framework          | Vitest 3.x                                                           |
| Config file        | `cli/vitest.config.ts`                                               |
| Quick run command  | `cd edulution-ai-framework/cli && npx vitest run --reporter=verbose` |
| Full suite command | `cd edulution-ai-framework/cli && npx vitest run`                    |

### Phase Requirements to Test Map

| Req ID  | Behavior                                                    | Test Type | Automated Command                                                                 | File Exists?                                              |
| ------- | ----------------------------------------------------------- | --------- | --------------------------------------------------------------------------------- | --------------------------------------------------------- |
| WKFL-01 | new-app.md exists and is valid markdown under 250 lines     | smoke     | `test -f docs/workflows/new-app.md && wc -l docs/workflows/new-app.md`            | No -- Wave 0                                              |
| WKFL-02 | add-feature.md exists and is valid markdown under 250 lines | smoke     | `test -f docs/workflows/add-feature.md && wc -l docs/workflows/add-feature.md`    | No -- Wave 0                                              |
| WKFL-03 | Both guides contain "Ask the user:" decision point blocks   | smoke     | `grep -c "Ask the user:" docs/workflows/new-app.md docs/workflows/add-feature.md` | No -- Wave 0                                              |
| WKFL-04 | Generated AGENTS.md contains workflow references            | unit      | `cd edulution-ai-framework/cli && npx vitest run --reporter=verbose`              | Partial -- scaffold-react.spec.ts exists but is todo-only |

### Sampling Rate

- **Per task commit:** `test -f docs/workflows/new-app.md && wc -l docs/workflows/new-app.md`
- **Per wave merge:** `cd edulution-ai-framework/cli && npx vitest run`
- **Phase gate:** All guide files exist, line counts under 250, decision points present, scaffold generates workflow refs

### Wave 0 Gaps

- [ ] `cli/src/__tests__/scaffold-react.spec.ts` -- existing but all tests are `.todo()`, needs real assertion that generated AGENTS.md includes workflow section
- [ ] Manual verification: Read both guides end-to-end to confirm AI-followability (cannot be automated)

## Sources

### Primary (HIGH confidence)

- Existing codebase: `cli/src/scaffold.ts` (lines 184-189) -- current AGENTS.md generation logic
- Existing codebase: `cli/templates/` -- complete template file inventory for both project types
- Existing codebase: `docs/integration-guide.md` -- pattern for docs in the framework repo
- Existing codebase: `custom-app/AGENTS.md`, `styled-page/AGENTS.md` -- convention layers guides must reference
- CONTEXT.md decisions -- all structural decisions locked by user

### Secondary (MEDIUM confidence)

- [Spec-driven development: Using Markdown as a programming language (GitHub Blog)](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-using-markdown-as-a-programming-language-when-building-with-ai/) -- linear markdown specs for AI consumption
- [Writing a good CLAUDE.md (HumanLayer Blog)](https://www.humanlayer.dev/blog/writing-a-good-claude-md) -- keeping AI instruction files concise and scoped
- [Improve your AI code output with AGENTS.md (Builder.io)](https://www.builder.io/blog/agents-md) -- AGENTS.md best practices
- [My LLM coding workflow going into 2026 (Addy Osmani)](https://addyosmani.com/blog/ai-coding-workflow/) -- multi-step AI coding workflows with decision points
- [A Complete Guide to AGENTS.md (AI Hero)](https://www.aihero.dev/a-complete-guide-to-agents-md) -- file format and discovery patterns
- [Programming with AI (Graphite)](https://graphite.com/guides/programming-with-ai-workflows-claude-copilot-cursor) -- AI workflow best practices across tools

### Tertiary (LOW confidence)

None -- all findings verified against codebase or official sources.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH -- no libraries needed, pure markdown + minor TS edit
- Architecture: HIGH -- all decisions locked in CONTEXT.md, file structure clear
- Pitfalls: HIGH -- derived from analyzing existing codebase patterns and AI documentation best practices

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable -- documentation patterns, no fast-moving dependencies)
