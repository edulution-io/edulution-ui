# Phase 3: CLI Scaffolding - Research

**Researched:** 2026-03-10
**Domain:** Node.js CLI tooling, project scaffolding, template-based code generation
**Confidence:** HIGH

## Summary

Phase 3 builds an interactive CLI (`npx edulution-create`) that scaffolds edulution-compatible projects. The CLI lives in the existing `edulution-ai-framework` repo, is written in TypeScript, compiled with tsup, and published to npm. It uses `@inquirer/prompts` for interactive prompts and a static template + variable injection + deep-merge approach for generating projects.

The core technical challenge is the template composition system: a base template per project type plus optional feature overlays (Tailwind, API client, auth, tests) that merge cleanly -- especially for shared files like `package.json`. The `deepmerge` library handles JSON merging, while file copying uses Node.js 22's native `fs.cp()` (recursive) to avoid external dependencies.

**Primary recommendation:** Build a single TypeScript CLI entry point with tsup bundling, organize templates as `templates/{type}/base/` + `templates/{type}/features/{feature}/` directories with real files containing `{{PLACEHOLDER}}` markers, and use `deepmerge` for package.json composition across base + selected features.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- Published as npm package, invoked via `npx edulution-create`
- CLI source, templates, and package all live in the edulution-ai-framework repo
- Written in TypeScript, compiled to JS for distribution
- Uses `@inquirer/prompts` for interactive prompts (select, checkbox, input, confirm)
- Project type first: Custom React App or Styled HTML Page
- Project name second (creates `./{name}/` in current working directory)
- Feature selection: all features are optional checkboxes for both project types (except tests not available for styled pages)
- Features: Tailwind + edulution theme, API client (axios/eduApi), Auth (SSO/OIDC), Test framework (Vitest)
- Dependency: selecting Auth auto-selects API client (greyed out) since SSO needs the backend connection
- ui-kit prompt only for custom React apps: npm package vs local checkout
- When local checkout selected: prompt for path, validate it exists and contains @edulution-io/ui-kit, warn if not found but allow proceeding
- Static file copy + variable injection (real files with `{{PLACEHOLDER}}` replacement)
- Base directory always copied, feature directories copied when selected
- Deep merge for shared files (e.g., package.json): base has minimal deps, each feature adds its own fragment, CLI deep-merges them
- Templates organized as `templates/{project-type}/base/` and `templates/{project-type}/features/{feature}/`
- CLI generates both CLAUDE.md and AGENTS.md in the scaffolded project
- AGENTS.md references the framework's base + project-type layer via `@edulution-ai-framework/...` paths
- Auto git init + auto add edulution-ai-framework as submodule
- Ask user whether to run `npm install` (confirm prompt, default yes)
- Auto create initial commit: `chore: scaffold {name} with edulution-create`
- Show feature checklist summary (included/not selected) + next steps (`cd {name}`, `npm run dev`)
- ui-kit two modes: npm package (`@edulution-io/ui-kit: ^1.0.0`) or local checkout (`file:../path`)
- Local checkout: validate path exists, warn if not found, wire both package.json file: reference AND tsconfig.json paths alias

### Claude's Discretion

- Exact placeholder syntax and merge implementation details
- How to handle styled page feature combinations (API client without React)
- npm package name and scope for the CLI
- Exact file structure within each template
- How to bundle/compile the TypeScript CLI for npm distribution

### Deferred Ideas (OUT OF SCOPE)

None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID     | Description                                                                                     | Research Support                                                                                                      |
| ------ | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| CLI-01 | Node.js CLI with interactive prompts for project type and configuration choices                 | @inquirer/prompts select/checkbox/input/confirm APIs; tsup for bundling; bin field in package.json                    |
| CLI-02 | React custom app scaffold generates working Vite+React+TS project with edulution Tailwind theme | Vite template structure; tailwind.config from ui-kit; CSS custom properties from index.scss; @vitejs/plugin-react     |
| CLI-03 | Styled HTML page scaffold generates project with Tailwind config and edulution design tokens    | Tailwind preset from styled-page AGENTS.md; CSS variables for light/dark; Tailwind CLI build step                     |
| CLI-04 | CLI prompts user to select pre-configurations (Tailwind, API client, auth, test framework)      | checkbox prompt with disabled+checked support (fixed in @inquirer/prompts); feature overlay directories               |
| CLI-05 | Auth integration scaffolding pre-wires SSO flow for same-origin edulution API                   | react-oidc-context ^3.2.0 + oidc-client-ts ^3.1.0 pattern from App.tsx; AuthProvider config; withCredentials on axios |
| CLI-06 | API client scaffolding configures axios to talk to edulution backend                            | custom-app AGENTS.md pattern: own axios instance, VITE_EDU_API_URL env var, withCredentials: true                     |
| CLI-07 | Optional Vitest test framework setup when user selects it                                       | vitest + jsdom + @testing-library/jest-dom; setup file pattern from apps/frontend/test/vitest.setup.ts                |
| CLI-08 | ui-kit dependency supported as both npm package and local checkout                              | npm: `@edulution-io/ui-kit: ^1.0.0`; local: `file:../path` + tsconfig paths alias                                     |

</phase_requirements>

## Standard Stack

### Core

| Library             | Version | Purpose                                                        | Why Standard                                                                 |
| ------------------- | ------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `@inquirer/prompts` | ^7.x    | Interactive CLI prompts (select, checkbox, input, confirm)     | Modern async/await API, native TypeScript, tree-shakable individual prompts  |
| `tsup`              | ^8.x    | Bundle TypeScript CLI to JS for npm distribution               | Zero-config esbuild bundler, auto-shebang for CLI executables, fast          |
| `deepmerge`         | ^4.x    | Deep-merge package.json fragments from base + feature overlays | 12K+ dependents, handles arrays and nested objects, customizable array merge |
| `picocolors`        | ^1.x    | Terminal output coloring for CLI messages                      | 7KB total, zero dependencies, fastest option, sufficient for CLI output      |

### Supporting (for scaffolded projects, not CLI itself)

| Library                     | Version | Purpose                          | When to Use                                    |
| --------------------------- | ------- | -------------------------------- | ---------------------------------------------- |
| `vite`                      | ^6.x    | Build tool for custom React apps | Always in React app template                   |
| `@vitejs/plugin-react`      | ^4.x    | React Fast Refresh for Vite      | Always in React app template                   |
| `react` + `react-dom`       | ^18.x   | UI library                       | Always in React app template                   |
| `typescript`                | ^5.x    | Type checking                    | Always in React app and optionally styled page |
| `tailwindcss`               | ^3.x    | Utility CSS with edulution theme | Tailwind feature overlay                       |
| `axios`                     | ^1.x    | HTTP client for edulution API    | API client feature overlay                     |
| `react-oidc-context`        | ^3.2.0  | OIDC auth provider for React     | Auth feature overlay                           |
| `oidc-client-ts`            | ^3.1.0  | OIDC client library              | Auth feature overlay (peer dep)                |
| `vitest`                    | ^3.x    | Test runner                      | Test framework feature overlay                 |
| `@testing-library/jest-dom` | ^6.x    | DOM assertions                   | Test framework feature overlay                 |
| `jsdom`                     | latest  | DOM environment for tests        | Test framework feature overlay                 |

### Alternatives Considered

| Instead of          | Could Use         | Tradeoff                                                                                  |
| ------------------- | ----------------- | ----------------------------------------------------------------------------------------- |
| `tsup`              | `tsc` only        | tsc works but no bundling/tree-shaking; tsup handles shebang insertion automatically      |
| `deepmerge`         | Hand-rolled merge | package.json array merging (dependencies, scripts) has edge cases; deepmerge handles them |
| `picocolors`        | `chalk`           | chalk is 101KB vs picocolors 7KB; CLI needs only basic coloring                           |
| `@inquirer/prompts` | `enquirer`        | enquirer is lighter but less TypeScript support; @inquirer/prompts is locked decision     |

**Installation (CLI dev dependencies):**

```bash
npm install --save @inquirer/prompts deepmerge picocolors
npm install --save-dev tsup typescript @types/node
```

## Architecture Patterns

### CLI Source Structure in edulution-ai-framework Repo

```
edulution-ai-framework/
  cli/
    package.json           # npm package config with bin field
    tsup.config.ts         # Build config
    tsconfig.json          # TypeScript config
    src/
      index.ts             # Entry point with #!/usr/bin/env node shebang
      prompts.ts           # All interactive prompt logic
      scaffold.ts          # File copy, merge, placeholder replacement
      post-scaffold.ts     # git init, submodule add, npm install, summary
      types.ts             # Shared TypeScript types
      constants.ts         # Feature names, placeholder tokens, defaults
    templates/
      custom-app/
        base/              # Minimal Vite+React+TS project files
          package.json     # Base dependencies only
          vite.config.ts
          tsconfig.json
          tsconfig.app.json
          index.html
          src/
            main.tsx
            App.tsx
            App.css
            vite-env.d.ts
          public/
            vite.svg
          _gitignore       # Renamed to .gitignore during copy
        features/
          tailwind/
            package.json   # Tailwind-specific deps fragment
            tailwind.config.ts
            postcss.config.js
            src/
              index.css    # CSS custom properties (light/dark themes)
          api-client/
            package.json   # axios dep fragment
            src/
              api/
                apiClient.ts
            _env.development  # VITE_EDU_API_URL placeholder
          auth/
            package.json   # react-oidc-context, oidc-client-ts deps
            src/
              auth/
                AuthProvider.tsx
                useAuth.ts
          tests/
            package.json   # vitest, @testing-library deps
            vitest.config.ts
            src/
              test/
                vitest.setup.ts
                App.spec.tsx
      styled-page/
        base/              # Minimal HTML + Tailwind CLI project
          package.json     # tailwindcss, postcss deps
          index.html
          src/
            styles.css     # Input CSS with @tailwind directives
          tailwind.config.js
          postcss.config.js
          _gitignore
        features/
          tailwind/        # (merged into base for styled pages -- Tailwind is structural)
            src/
              theme.css    # CSS custom properties (light/dark themes)
          api-client/
            package.json
            src/
              api.js       # Plain fetch/axios without React
          auth/
            package.json
            src/
              auth.js      # OIDC redirect flow without React wrapper
    dist/                  # Build output (gitignored)
```

### Pattern 1: Template Copy + Merge Pipeline

**What:** Three-phase scaffold: (1) copy base directory, (2) overlay selected feature directories, (3) deep-merge shared JSON files.

**When to use:** Always -- this is the core scaffolding approach.

**Implementation:**

```typescript
// Phase 1: Copy base template
await fs.cp(baseDir, targetDir, { recursive: true });

// Phase 2: Overlay each selected feature
for (const feature of selectedFeatures) {
  const featureDir = path.join(templateDir, 'features', feature);
  await copyFeatureOverlay(featureDir, targetDir);
}

// Phase 3: Deep-merge package.json from all sources
const basePkg = readJson(path.join(baseDir, 'package.json'));
const featurePkgs = selectedFeatures.map((f) => readJson(path.join(templateDir, 'features', f, 'package.json')));
const mergedPkg = featurePkgs.reduce((acc, pkg) => deepmerge(acc, pkg), basePkg);
mergedPkg.name = projectName;
writeJson(path.join(targetDir, 'package.json'), mergedPkg);
```

### Pattern 2: Placeholder Replacement

**What:** Real template files contain `{{PLACEHOLDER}}` markers replaced with user values during scaffold.

**When to use:** For project name, API URL defaults, auth config values.

**Implementation:**

```typescript
const PLACEHOLDER_MAP: Record<string, string> = {
  '{{PROJECT_NAME}}': config.projectName,
  '{{EDU_API_URL}}': 'http://localhost:3001',
  '{{AUTH_AUTHORITY}}': '${EDU_API_URL}/auth',
};

const replaceInFile = async (filePath: string, replacements: Record<string, string>) => {
  let content = await fs.readFile(filePath, 'utf-8');
  for (const [placeholder, value] of Object.entries(replacements)) {
    content = content.replaceAll(placeholder, value);
  }
  await fs.writeFile(filePath, content, 'utf-8');
};
```

### Pattern 3: File Rename Convention

**What:** Template files that start with `_` are renamed to `.` prefix during copy (e.g., `_gitignore` becomes `.gitignore`).

**When to use:** For dotfiles that would confuse git or npm if stored with their real names.

**Implementation:**

```typescript
const RENAME_MAP: Record<string, string> = {
  _gitignore: '.gitignore',
  '_env.development': '.env.development',
  _env: '.env',
};
```

This is the same pattern used by `create-vite` (verified from source).

### Pattern 4: Post-Scaffold Automation

**What:** After files are written: git init, add submodule, optionally npm install, create initial commit, print summary.

**When to use:** Always after file generation completes.

**Implementation sequence:**

1. `git init` in the new project directory
2. `git submodule add git@github.com:edulution-io/edulution-ai-framework.git edulution-ai-framework`
3. Prompt: "Run npm install? (Y/n)"
4. If yes: `npm install` (spawn child process, stream output)
5. `git add -A && git commit -m "chore: scaffold {name} with edulution-create"`
6. Print feature checklist and next steps

### Anti-Patterns to Avoid

- **EJS/Handlebars templating for source files:** Do not use template engines for code files. Real files with simple `{{PLACEHOLDER}}` replacement are easier to maintain, test, and debug. Template engines add dependencies and obscure the actual output.
- **Single monolithic template directory:** Do not put all features in one directory with conditionals. The base+feature overlay approach keeps templates composable and testable independently.
- **Inline package.json generation:** Do not construct package.json programmatically with string concatenation. Use real JSON files per feature and deep-merge them.

## Don't Hand-Roll

| Problem                              | Don't Build                    | Use Instead                         | Why                                                                              |
| ------------------------------------ | ------------------------------ | ----------------------------------- | -------------------------------------------------------------------------------- |
| Deep merging JSON objects            | Custom recursive merge         | `deepmerge` library                 | Array handling edge cases (dependencies, scripts), circular reference protection |
| CLI prompt interaction               | Custom stdin/readline handling | `@inquirer/prompts`                 | Cursor control, validation, accessibility, terminal compatibility                |
| TypeScript to JS compilation for npm | Manual tsc + chmod             | `tsup` with shebang support         | Auto-executable output, source maps, tree-shaking                                |
| Terminal colors                      | ANSI escape sequences          | `picocolors`                        | Cross-platform terminal support, NO_COLOR env respect                            |
| File copy with directories           | Custom recursive walk          | `fs.cp({ recursive: true })`        | Native Node.js 22 API, handles symlinks, permissions                             |
| Git operations                       | Custom git protocol            | `child_process.execSync('git ...')` | Reliable, uses user's git config, handles SSH keys                               |

**Key insight:** The CLI is a thin orchestration layer -- prompts, file ops, git commands. Every piece except the merge+replace+rename logic should be delegated to established tools.

## Common Pitfalls

### Pitfall 1: Checkbox Disabled + Checked Behavior

**What goes wrong:** When Auth is selected, API client should auto-select and be disabled. Historically, `@inquirer/prompts` checkbox excluded disabled items from answers even if checked.
**Why it happens:** Old versions of @inquirer/checkbox didn't include disabled+checked items in results.
**How to avoid:** This was fixed in @inquirer/prompts (PR #2006). Use latest version (^7.x). Verify with a test that disabled+checked items appear in the answer array. As a safety fallback, post-process the answers to ensure API client is included when Auth is selected.
**Warning signs:** Auth selected but API client not in scaffolded project.

### Pitfall 2: Package.json Array Merge Creates Duplicates

**What goes wrong:** `deepmerge` default array merge concatenates arrays, which can create duplicate entries if base and feature both reference the same script name.
**Why it happens:** deepmerge's default array strategy is concatenation, not union.
**How to avoid:** Use `deepmerge` with `arrayMerge: overwriteMerge` option for package.json, since package.json arrays (scripts) should overwrite, not concatenate. Dependencies are objects so they merge correctly by default.
**Warning signs:** Duplicate entries in scripts array or unexpected array values in merged package.json.

### Pitfall 3: Submodule SSH vs HTTPS URL

**What goes wrong:** `git submodule add` with SSH URL fails if user doesn't have SSH keys configured.
**Why it happens:** The framework repo is private, requiring authentication. SSH is standard for development but HTTPS may be needed for CI.
**How to avoid:** Use SSH URL (`git@github.com:...`) as default (matches integration guide). If the `git submodule add` command fails, catch the error, suggest HTTPS as alternative, and print the manual command for the user.
**Warning signs:** Submodule add fails with "Permission denied (publickey)".

### Pitfall 4: Template Files Accidentally Processed by npm/git

**What goes wrong:** `.gitignore` in template directories affects the template repo itself. `.npmignore` excludes template files from the published package.
**Why it happens:** Git and npm process dotfiles in all directories, including template directories.
**How to avoid:** Use the `_prefix` rename convention (`_gitignore`, `_env.development`). Ensure `.npmignore` or package.json `files` field explicitly includes the `templates/` directory.
**Warning signs:** Published npm package missing template files; template dotfiles affecting framework repo behavior.

### Pitfall 5: Placeholder Replacement in Binary Files

**What goes wrong:** Running string replacement on images, fonts, or other binary files corrupts them.
**Why it happens:** The placeholder replacement function reads all files as UTF-8.
**How to avoid:** Only process text files for placeholder replacement. Check file extension against a whitelist: `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.html`, `.css`, `.scss`, `.md`, `.yml`, `.yaml`, `.env*`.
**Warning signs:** Corrupted images or fonts in scaffolded project.

### Pitfall 6: npm Package Excludes Templates

**What goes wrong:** Published CLI package doesn't include template files.
**Why it happens:** Default npm publishing uses `.gitignore` to determine what to exclude. Template directories may contain `node_modules` references or patterns that match gitignore rules.
**How to avoid:** Use explicit `files` field in CLI package.json: `"files": ["dist", "templates"]`. Test with `npm pack --dry-run` before publishing.
**Warning signs:** `npx edulution-create` fails with "template directory not found".

## Code Examples

### CLI Entry Point

```typescript
#!/usr/bin/env node
// src/index.ts

import { select, input, checkbox, confirm } from '@inquirer/prompts';
import { scaffold } from './scaffold';
import { postScaffold } from './post-scaffold';
import { PROJECT_TYPES, FEATURES } from './constants';
import type { ScaffoldConfig } from './types';

const run = async () => {
  const projectType = await select({
    message: 'What type of project?',
    choices: [
      { name: 'Custom React App', value: PROJECT_TYPES.CUSTOM_APP },
      { name: 'Styled HTML Page', value: PROJECT_TYPES.STYLED_PAGE },
    ],
  });

  const projectName = await input({
    message: 'Project name:',
    validate: (value) => {
      if (!value.trim()) return 'Project name is required';
      if (!/^[a-z0-9-]+$/.test(value)) return 'Use lowercase letters, numbers, and hyphens only';
      return true;
    },
  });

  // Build feature choices based on project type
  const featureChoices = FEATURES.filter(
    (f) => !(f.value === 'tests' && projectType === PROJECT_TYPES.STYLED_PAGE),
  ).map((f) => ({ ...f }));

  const selectedFeatures = await checkbox({
    message: 'Select features:',
    choices: featureChoices,
  });

  // Auth auto-selects API client
  const features =
    selectedFeatures.includes('auth') && !selectedFeatures.includes('api-client')
      ? [...selectedFeatures, 'api-client']
      : selectedFeatures;

  const config: ScaffoldConfig = { projectType, projectName, features };

  // ui-kit prompt for custom React apps
  if (projectType === PROJECT_TYPES.CUSTOM_APP) {
    // ... ui-kit mode selection
  }

  await scaffold(config);
  await postScaffold(config);
};

run().catch(console.error);
```

### Deep Merge for package.json

```typescript
import deepmerge from 'deepmerge';

const overwriteArrayMerge = (_target: unknown[], source: unknown[]) => source;

const mergePackageJsons = (base: Record<string, unknown>, ...features: Record<string, unknown>[]) => {
  return features.reduce((acc, pkg) => deepmerge(acc, pkg, { arrayMerge: overwriteArrayMerge }), base);
};
```

### tsup Configuration

```typescript
// cli/tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node22',
  clean: true,
  splitting: false,
  sourcemap: false,
  dts: false,
  banner: {
    js: '#!/usr/bin/env node',
  },
});
```

Note: tsup automatically inserts the shebang when the entry file contains `#!/usr/bin/env node`, but using the `banner` option is more explicit and reliable.

### CLI package.json

```json
{
  "name": "edulution-create",
  "version": "0.1.0",
  "description": "Scaffold edulution-compatible projects",
  "type": "module",
  "bin": {
    "edulution-create": "./dist/index.mjs"
  },
  "files": ["dist", "templates"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "engines": {
    "node": ">=22"
  },
  "dependencies": {
    "@inquirer/prompts": "^7.0.0",
    "deepmerge": "^4.3.1",
    "picocolors": "^1.1.0"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.5.0",
    "@types/node": "^22.0.0"
  }
}
```

### Auth Template (AuthProvider.tsx)

```tsx
// templates/custom-app/features/auth/src/auth/AuthProvider.tsx
import { AuthProvider as OidcAuthProvider, AuthProviderProps } from 'react-oidc-context';
import { WebStorageStateStore } from 'oidc-client-ts';

const EDU_API_URL = import.meta.env.VITE_EDU_API_URL;

const oidcConfig: AuthProviderProps = {
  authority: `${EDU_API_URL}/auth`,
  client_id: '{{AUTH_CLIENT_ID}}',
  redirect_uri: window.location.origin,
  loadUserInfo: true,
  automaticSilentRenew: true,
  userStore: new WebStorageStateStore({ store: localStorage }),
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};

const AuthWrapper = ({ children }: { children: React.ReactNode }) => (
  <OidcAuthProvider {...oidcConfig}>{children}</OidcAuthProvider>
);

export default AuthWrapper;
```

### API Client Template

```typescript
// templates/custom-app/features/api-client/src/api/apiClient.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_EDU_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export default apiClient;
```

### Styled Page API Client (No React)

```javascript
// templates/styled-page/features/api-client/src/api.js
const API_BASE_URL = '{{EDU_API_URL}}';

const apiFetch = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
};
```

## State of the Art

| Old Approach                      | Current Approach                       | When Changed        | Impact                                                                    |
| --------------------------------- | -------------------------------------- | ------------------- | ------------------------------------------------------------------------- |
| `fs-extra` for recursive copy     | `fs.cp({ recursive: true })`           | Node.js 22 (stable) | No external dependency needed for file operations                         |
| `inquirer` (v8, CJS)              | `@inquirer/prompts` (v7, ESM)          | 2024                | Tree-shakable, native TypeScript, async/await, individual prompt packages |
| chalk for CLI colors              | picocolors                             | 2023+               | 14x smaller, faster, zero deps                                            |
| Template engines (EJS/Handlebars) | Static files + placeholder replacement | Industry trend      | Simpler maintenance, real files are easier to test                        |
| `tsc` for CLI packaging           | `tsup` (esbuild)                       | 2023+               | Single-file output, auto-shebang, faster builds                           |

**Deprecated/outdated:**

- `inquirer` (classic, CJS-only): Use `@inquirer/prompts` instead -- modular, ESM, TypeScript-native
- `fs-extra` for simple copy operations: Use native `fs.cp()` on Node.js 22+

## Open Questions

1. **Styled page auth without React**
   - What we know: Auth feature uses `react-oidc-context` which is React-specific. Styled pages may not use React.
   - What's unclear: How to implement OIDC auth flow for plain HTML/JS pages
   - Recommendation: Use `oidc-client-ts` directly (no React wrapper) with redirect-based flow. Create a simpler `auth.js` that handles the OIDC redirect dance using vanilla JS.

2. **npm package scope**
   - What we know: CLI is invoked as `npx edulution-create`. User didn't specify a scope.
   - What's unclear: Whether to use `@edulution-io/create` (scoped) or `edulution-create` (unscoped)
   - Recommendation: Use `edulution-create` (unscoped) since `npx edulution-create` is the decided invocation. Scoped packages require `npx @scope/name` which differs from the locked decision.

3. **Tailwind version: v3 vs v4**
   - What we know: edulution-ui uses Tailwind v3 with PostCSS plugin approach. The ui-kit tailwind.config uses `var()` CSS custom properties.
   - What's unclear: Whether to scaffold with Tailwind v3 (matching edulution-ui) or v4 (latest).
   - Recommendation: Use Tailwind v3 to match edulution-ui's existing config and ensure compatibility with the synced artifacts. The config format in the framework AGENTS.md is v3-style.

## Validation Architecture

### Test Framework

| Property           | Value                                                                |
| ------------------ | -------------------------------------------------------------------- |
| Framework          | Vitest (matching project standard)                                   |
| Config file        | None -- Wave 0 gap, needs creation in `cli/` directory               |
| Quick run command  | `cd edulution-ai-framework/cli && npx vitest run --reporter=verbose` |
| Full suite command | `cd edulution-ai-framework/cli && npx vitest run`                    |

### Phase Requirements to Test Map

| Req ID | Behavior                                                                  | Test Type   | Automated Command                                     | File Exists? |
| ------ | ------------------------------------------------------------------------- | ----------- | ----------------------------------------------------- | ------------ |
| CLI-01 | Interactive prompts present correct choices for project type and features | integration | `vitest run src/__tests__/prompts.spec.ts -x`         | No -- Wave 0 |
| CLI-02 | React app scaffold produces runnable Vite+React+TS project                | integration | `vitest run src/__tests__/scaffold-react.spec.ts -x`  | No -- Wave 0 |
| CLI-03 | Styled page scaffold produces project with Tailwind and tokens            | integration | `vitest run src/__tests__/scaffold-styled.spec.ts -x` | No -- Wave 0 |
| CLI-04 | Feature selection correctly composes template overlays                    | unit        | `vitest run src/__tests__/merge.spec.ts -x`           | No -- Wave 0 |
| CLI-05 | Auth feature wires SSO with OIDC config                                   | unit        | `vitest run src/__tests__/features-auth.spec.ts -x`   | No -- Wave 0 |
| CLI-06 | API client feature configures axios                                       | unit        | `vitest run src/__tests__/features-api.spec.ts -x`    | No -- Wave 0 |
| CLI-07 | Vitest setup generated when tests selected                                | unit        | `vitest run src/__tests__/features-tests.spec.ts -x`  | No -- Wave 0 |
| CLI-08 | ui-kit npm vs local checkout wiring                                       | unit        | `vitest run src/__tests__/uikit-mode.spec.ts -x`      | No -- Wave 0 |

### Sampling Rate

- **Per task commit:** `cd edulution-ai-framework/cli && npx vitest run --reporter=verbose`
- **Per wave merge:** `cd edulution-ai-framework/cli && npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `cli/vitest.config.ts` -- test configuration for the CLI package
- [ ] `cli/src/__tests__/merge.spec.ts` -- tests for package.json deep-merge logic
- [ ] `cli/src/__tests__/scaffold-react.spec.ts` -- tests for React app scaffold output
- [ ] `cli/src/__tests__/scaffold-styled.spec.ts` -- tests for styled page scaffold output
- [ ] `cli/src/__tests__/prompts.spec.ts` -- tests for prompt flow logic
- [ ] `cli/src/__tests__/features-auth.spec.ts` -- tests for auth feature overlay
- [ ] `cli/src/__tests__/features-api.spec.ts` -- tests for API client overlay
- [ ] `cli/src/__tests__/features-tests.spec.ts` -- tests for Vitest setup overlay
- [ ] `cli/src/__tests__/uikit-mode.spec.ts` -- tests for ui-kit npm vs local mode
- [ ] Framework install: `cd edulution-ai-framework/cli && npm install` -- no npm infrastructure exists yet

## Sources

### Primary (HIGH confidence)

- `edulution-ai-framework/` repo -- inspected directory structure, all AGENTS.md layers, integration guide, composite action
- `apps/frontend/src/App.tsx` -- OIDC auth pattern with react-oidc-context + oidc-client-ts
- `apps/frontend/src/api/eduApi.ts` -- API client pattern with axios
- `apps/frontend/tailwind.config.ts` + `libs/ui-kit/tailwind.config.ts` -- Tailwind config patterns
- `apps/frontend/src/index.scss` -- CSS custom properties for light/dark themes
- `libs/src/auth/constants/auth-config.ts` + `auth-paths.ts` -- Auth configuration constants
- `apps/frontend/vite.config.mts` -- Vite configuration pattern for reference
- [create-vite source code](https://github.com/vitejs/vite/tree/main/packages/create-vite) -- Template copy + rename pattern (verified `_gitignore` convention and `editFile` utility)

### Secondary (MEDIUM confidence)

- [@inquirer/prompts npm](https://www.npmjs.com/package/@inquirer/prompts) -- Prompt API: select, checkbox, input, confirm; disabled+checked fix confirmed via [GitHub issue #575](https://github.com/SBoudrias/Inquirer.js/issues/575) (PR #2006)
- [tsup documentation](https://tsup.egoist.dev/) -- CLI bundling with shebang support, banner option, ESM output
- [deepmerge npm](https://www.npmjs.com/package/deepmerge) -- Array merge customization, 12K+ dependents
- [picocolors](https://github.com/alexeyraspopov/picocolors) -- 7KB, zero deps, fastest terminal coloring
- [Node.js fs.cp](https://nodejs.org/api/fs.html) -- Native recursive copy, stable in Node.js 22
- [react-oidc-context](https://www.npmjs.com/package/react-oidc-context) -- OIDC provider for React, Keycloak integration pattern

### Tertiary (LOW confidence)

- npm package naming (`edulution-create` vs `@edulution-io/create`) -- based on convention analysis, not confirmed with npm registry availability check

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH -- all libraries verified via npm, project patterns inspected in source
- Architecture: HIGH -- template strategy confirmed from create-vite patterns and user decisions
- Pitfalls: HIGH -- checkbox disabled+checked fix verified via GitHub issue, file rename convention verified from create-vite source
- Auth integration: MEDIUM -- pattern extracted from edulution-ui App.tsx, but styled-page auth (non-React) needs implementation decision
- Styled page features: MEDIUM -- API client and auth without React need different implementations than React versions

**Research date:** 2026-03-10
**Valid until:** 2026-04-10 (stable domain, dependencies well-established)
