# Technology Stack

**Project:** edulution-ai-framework
**Researched:** 2026-03-09

## Recommended Stack

### CLI Runtime & Language

| Technology | Version | Purpose  | Why                                                                                                                                                                                                                           | Confidence |
| ---------- | ------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Node.js    | >=22.18 | Runtime  | Already used by the team (v22.21.1 on dev machines). v22 is current LTS. Native TypeScript type-stripping enabled by default since 22.18, so no build step needed for the CLI.                                                | HIGH       |
| TypeScript | ~5.7    | Language | Matches edulution-ui. Use only erasable syntax (no enums, no namespaces) so Node.js native type-stripping works without tsx/ts-node. Use `const` objects + derived types instead of enums per existing AGENTS.md conventions. | HIGH       |

**Key decision: No tsx/ts-node dependency.** Node.js 22.18+ strips types natively. The CLI runs directly with `node setup.ts` (or via a bin entry that calls `node --experimental-strip-types` on older 22.x). This eliminates a runtime dependency and simplifies the framework repo. If you need `tsconfig.json` path aliases or decorators, reconsider -- but a CLI of this scope does not.

### CLI Libraries

| Technology        | Version | Purpose             | Why                                                                                                                                                                                                                                     | Confidence |
| ----------------- | ------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| commander         | ^14.0   | Command parsing     | De facto standard (118K dependents). Declarative commands, auto-generated help, git-style subcommands. Requires Node >=20 which aligns with our >=22 baseline.                                                                          | HIGH       |
| @inquirer/prompts | ^8.3    | Interactive prompts | Modern rewrite of inquirer.js. Tree-shakeable individual prompts (`@inquirer/select`, `@inquirer/checkbox`, etc.). 4.7K dependents, actively maintained. Superior to legacy `inquirer` (monolithic) and `enquirer` (stale maintenance). | HIGH       |
| picocolors        | ^1.1    | Terminal colors     | 14x smaller and 2x faster than chalk. No ESM-only headaches (chalk 5 is ESM-only, problematic with native TS stripping). Used by PostCSS, Vite, Browserslist. Zero dependencies.                                                        | HIGH       |
| ora               | ^8.0    | Spinners            | Lightweight spinner for long operations (npm install, git init). Well-maintained, small footprint.                                                                                                                                      | MEDIUM     |

### Template Engine

| Technology | Version | Purpose          | Why                                                                                                                                                                                                                                                                                                       | Confidence |
| ---------- | ------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| EJS        | ^3.1    | File scaffolding | Generates project files from templates. Simple `<%= variable %>` syntax, no learning curve. Preferred over Handlebars because scaffolding templates need inline JS logic (conditionals for optional features) which Handlebars deliberately forbids. No complex partials system needed for this use case. | MEDIUM     |

**Alternative considered: Raw string templates.** For a small number of templates, ES template literals could suffice. But EJS is better because: templates live as separate files (easier to maintain/review), and the CLI needs to generate 10+ files with conditional sections.

### File System & Utilities

| Technology | Version | Purpose               | Why                                                                                                                                     | Confidence |
| ---------- | ------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| fs-extra   | ^11.2   | File operations       | `copySync`, `ensureDirSync`, `outputFileSync` -- convenience wrappers over `fs` that eliminate boilerplate. Widely used, stable.        | HIGH       |
| glob       | ^11.0   | File pattern matching | For discovering template files. Native `fs.glob` is only available in Node 22.x behind a flag; the `glob` package is stable and proven. | MEDIUM     |

### Testing

| Technology | Version | Purpose    | Why                                                                                                                                                         | Confidence |
| ---------- | ------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| vitest     | ^3.0    | Unit tests | Matches edulution-ui frontend testing. Fast, TypeScript-native, good DX. Test the CLI logic (template rendering, config generation) without E2E complexity. | HIGH       |

### Linting & Formatting

| Technology | Version | Purpose    | Why                                                                               | Confidence |
| ---------- | ------- | ---------- | --------------------------------------------------------------------------------- | ---------- |
| ESLint     | ^9.0    | Linting    | Flat config format. Align rules with edulution-ui conventions.                    | HIGH       |
| Prettier   | ^3.0    | Formatting | Same config as edulution-ui (2 spaces, 120 cols, single quotes, trailing commas). | HIGH       |

### Git Submodule Tooling

| Technology    | Version    | Purpose             | Why                                                                                                           | Confidence |
| ------------- | ---------- | ------------------- | ------------------------------------------------------------------------------------------------------------- | ---------- |
| git submodule | (built-in) | Embedding framework | Decision already made in PROJECT.md. Framework repo added at `edulution-ai-framework/` in consuming projects. | HIGH       |

**Submodule best practices for this project:**

1. **Pin to tags, not branches.** Consuming projects should reference a semver tag (`v1.2.0`), not `main`. This prevents accidental breakage when the framework updates.
2. **Document clone commands.** New developers need `git clone --recurse-submodules` or `git submodule update --init` after clone. Add this to each consuming project's README.
3. **CI must init submodules.** GitHub Actions needs `submodules: 'recursive'` in `actions/checkout`.
4. **Framework updates are explicit.** Run `cd edulution-ai-framework && git fetch && git checkout v1.3.0 && cd .. && git add edulution-ai-framework && git commit` to update.
5. **No nested submodules.** The framework repo itself must not contain submodules -- keep it flat.

### CI / Cross-Repo Sync (GitHub Actions)

| Technology           | Version | Purpose                          | Why                                                                                                                                                                                                                                       | Confidence |
| -------------------- | ------- | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| actions/checkout     | v4      | Checkout repos                   | Standard. Use `submodules: 'recursive'` when consuming projects need the framework.                                                                                                                                                       | HIGH       |
| Custom sync workflow | N/A     | Push artifacts to framework repo | Write a custom workflow (not a marketplace action) because: (a) the sync is simple (copy 2-3 files, commit, push), (b) marketplace actions add supply-chain risk, (c) custom gives full control over commit messages and branch strategy. | HIGH       |
| Fine-grained PAT     | N/A     | Cross-repo auth                  | GitHub fine-grained personal access token scoped to only the framework repo with `contents: write`. Store as repository secret `FRAMEWORK_REPO_TOKEN`.                                                                                    | HIGH       |

**Sync workflow pattern (in edulution-ui):**

```yaml
# .github/workflows/sync-to-framework.yml
name: Sync artifacts to framework repo
on:
  push:
    branches: [dev, main]
    paths:
      - 'swagger-spec.json'
      - 'apps/frontend/tailwind.config.ts'

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Clone framework repo
        run: |
          git clone https://x-access-token:${{ secrets.FRAMEWORK_REPO_TOKEN }}@github.com/edulution-io/edulution-ai-framework.git /tmp/framework

      - name: Copy artifacts
        run: |
          cp swagger-spec.json /tmp/framework/artifacts/
          cp apps/frontend/tailwind.config.ts /tmp/framework/artifacts/

      - name: Commit and push
        run: |
          cd /tmp/framework
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add -A
          git diff --cached --quiet || git commit -m "sync: update artifacts from edulution-ui $(date +%Y-%m-%d)"
          git push
```

**Why not marketplace sync actions:** `Redocly/repo-file-sync-action` and `cpina/github-action-push-to-another-repository` are popular but: (a) they add third-party code executing with your PAT, (b) the sync logic here is 15 lines of bash, (c) you want control over commit messages for the framework's changelog.

### Project Scaffolding Output Stack

These are the technologies the CLI installs _into_ scaffolded projects (not dependencies of the framework itself):

| Technology                | Purpose       | Project Type      | Notes                                                                    |
| ------------------------- | ------------- | ----------------- | ------------------------------------------------------------------------ |
| Vite + React + TypeScript | App framework | Custom React apps | Match edulution-ui's stack. Use `npm create vite@latest` under the hood. |
| Tailwind CSS v4           | Styling       | Both React & HTML | Synced config from edulution-ui.                                         |
| axios                     | HTTP client   | Custom React apps | Configured as `eduApi` pattern from edulution-ui.                        |
| vitest                    | Testing       | Custom React apps | Optional pre-configuration.                                              |
| ESLint + Prettier         | Code quality  | Custom React apps | Aligned with edulution-ui config.                                        |

For styled HTML/CSS/JS pages, the CLI outputs only: Tailwind config, a source CSS file importing edulution tokens, and a build script (`npx @tailwindcss/cli -i src/input.css -o dist/output.css`).

### Package Management

| Technology | Purpose         | Why                                                                                |
| ---------- | --------------- | ---------------------------------------------------------------------------------- |
| npm        | Package manager | Matches edulution-ui. No reason to introduce pnpm/yarn for a single-repo CLI tool. |

## What NOT to Use

| Technology               | Why Not                                                                                                                                                              |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tsx / ts-node            | Unnecessary -- Node.js 22.18+ strips types natively. Adding tsx is an extra dependency for zero benefit in this project.                                             |
| chalk (v5+)              | ESM-only, causes issues with native TypeScript type-stripping in Node.js. picocolors is smaller, faster, and CJS-compatible.                                         |
| inquirer (legacy)        | Monolithic package. Use `@inquirer/prompts` (modular, tree-shakeable, actively developed).                                                                           |
| enquirer                 | Maintenance has stalled. Last meaningful update was 2022.                                                                                                            |
| yeoman / hygen / plop    | Heavyweight scaffolding frameworks. This project needs a single setup script, not a plugin ecosystem. EJS + commander + inquirer covers it with less abstraction.    |
| Handlebars               | Deliberately logic-less, which is a problem for scaffolding templates that need conditionals (`if user chose auth, include auth setup`). EJS handles this naturally. |
| oclif                    | Enterprise CLI framework (Heroku/Salesforce scale). Massive overkill for a single `setup` command with prompts.                                                      |
| Marketplace sync actions | Supply-chain risk with PAT tokens. The sync logic is trivial bash.                                                                                                   |
| git subtree              | PROJECT.md already decided on submodules. Subtree merges history, making the consuming repo harder to reason about.                                                  |

## Repo Structure (Framework)

```
edulution-ai-framework/
  bin/
    setup.ts              # CLI entry point (hashbang: #!/usr/bin/env node)
  src/
    cli/
      commands/            # commander command definitions
      prompts/             # @inquirer/prompts flows
    scaffolding/
      templates/           # EJS templates organized by project type
        react-app/
        html-page/
      generators/          # Logic to render templates + write files
    context/               # AI context layer logic
  docs/                    # AI coding context markdown files
    base/                  # Base conventions (all project types)
    overrides/
      core/                # edulution-ui specific
      react-app/           # Custom React app specific
      html-page/           # Styled page specific
    workflows/             # "new app" and "add feature" guides
  artifacts/               # CI-synced files from edulution-ui
    swagger-spec.json
    tailwind.config.ts
  AGENTS.md                # Root AI context file (assembled from docs/)
  package.json
  tsconfig.json
```

## Installation (Framework Development)

```bash
# Clone the framework repo
git clone git@github.com:edulution-io/edulution-ai-framework.git
cd edulution-ai-framework

# Install dependencies
npm install

# Run the CLI locally
node bin/setup.ts

# Run tests
npm test
```

## package.json Shape

```json
{
  "name": "edulution-ai-framework",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "edulution-setup": "./bin/setup.ts"
  },
  "engines": {
    "node": ">=22.18.0"
  },
  "scripts": {
    "setup": "node bin/setup.ts",
    "test": "vitest run",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "@inquirer/prompts": "^8.3.0",
    "commander": "^14.0.3",
    "ejs": "^3.1.10",
    "fs-extra": "^11.2.0",
    "picocolors": "^1.1.1"
  },
  "devDependencies": {
    "@types/ejs": "^3.1.5",
    "@types/fs-extra": "^11.0.4",
    "@types/node": "^22.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "typescript": "~5.7.0",
    "vitest": "^3.0.0"
  }
}
```

**Note on `"type": "module"`:** Required for native TypeScript type-stripping to work cleanly with ES module imports. All source files use `import/export` syntax. The `bin` entry points directly to `.ts` files -- Node.js 22.18+ handles this when type-stripping is enabled.

## Sources

- [commander npm](https://www.npmjs.com/package/commander) - v14.0.3, 118K dependents
- [@inquirer/prompts npm](https://www.npmjs.com/package/@inquirer/prompts) - v8.3.0, modern Inquirer rewrite
- [picocolors npm](https://www.npmjs.com/package/picocolors) - 14x smaller than chalk, 2x faster
- [picocolors vs chalk comparison](https://npmtrends.com/chalk-vs-picocolors)
- [Node.js native TypeScript support](https://nodejs.org/en/learn/typescript/run-natively) - type stripping enabled by default in 22.18+
- [tsx npm](https://www.npmjs.com/package/tsx) - v4.21.0, but unnecessary with native Node.js support
- [Repo File Sync Action](https://github.com/Redocly/repo-file-sync-action) - considered but rejected for custom workflow
- [Push a file to another repository](https://github.com/marketplace/actions/push-a-file-to-another-repository) - considered but rejected
- [Git Submodules best practices](https://thebottleneckdev.com/blog/monorepo-git-submodules) - pin to tags, document clone commands
- [Git Submodules vs Monorepos](https://medium.com/@fulton_shaun/git-submodules-vs-monorepos-whats-the-best-strategy-caa5de25490b)
- [Node.js TypeScript docs](https://nodejs.org/api/typescript.html) - official documentation on type stripping
