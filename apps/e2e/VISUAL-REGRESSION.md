# Visual Regression Testing

## Overview

Visual regression tests capture screenshot baselines for key pages and compare future
changes against them. Any CSS or layout change that exceeds the diff threshold fails the test.

## Screenshot Baselines

Baselines are stored under `tests/__screenshots__/` and committed to the repository.
Each page has light and dark theme variants. Menubar expand/collapse states are also captured.

### Pages Covered

- Login (light/dark)
- Dashboard (light/dark)
- File Browser (light/dark)
- Survey Editor (light/dark)
- Mail (light/dark)
- Settings (light/dark)
- Menubar (expanded/collapsed)

## Updating Baselines

When an intentional visual change is made, update the baselines:

```bash
cd apps/e2e
npx playwright test tests/visual/ --update-snapshots
```

Review the updated screenshots and commit them.

## Containerized CI Approach (VRAT-05)

Screenshot baselines are sensitive to rendering differences between environments
(font hinting, antialiasing, GPU compositing, system fonts). For deterministic
baselines in CI:

1. **Use Playwright's Docker image** as the CI runner:

   ```yaml
   container:
     image: mcr.microsoft.com/playwright:v1.52.0-noble
   ```

2. **Generate baselines inside the same container** used in CI. Developers should
   generate baselines using the same Docker image locally:

   ```bash
   docker run --rm -v $(pwd):/work -w /work mcr.microsoft.com/playwright:v1.52.0-noble \
     npx playwright test tests/visual/ --update-snapshots
   ```

3. **Pin the Playwright version** in both `package.json` and the Docker image tag
   to avoid drift between local and CI rendering.

4. **Threshold configuration** in `playwright.config.ts`:
   - `maxDiffPixelRatio: 0.01` — allows up to 1% pixel difference
   - `threshold: 0.2` — per-pixel color difference tolerance (0-1 scale)

5. **Single browser for baselines**: Visual regression tests run only on Chromium
   by default to keep baseline count manageable. Cross-browser visual testing can
   be added as a separate non-blocking job if needed.

## Accessibility Scans

The `tests/accessibility/` directory contains axe-core powered accessibility scans
that run alongside visual tests. These fail on critical/serious WCAG violations and
warn on moderate ones. See `utils/a11y.ts` for the scan helper.

## Playwright MCP Server (CICD-06)

The Playwright MCP (Model Context Protocol) server is configured for AI-assisted
test development. The `.playwright-mcp` directory is in `.gitignore`.

### Usage Pattern

1. Connect Claude Code or another AI tool to the Playwright MCP server
2. The MCP server provides browser automation tools (navigate, click, fill, screenshot, snapshot)
3. Use these tools to explore the live application and generate E2E test code
4. The AI can take snapshots of the page DOM, interact with elements, and verify behavior
5. Generated tests should follow the existing Page Object Model pattern in `page-objects/`

### Benefits

- Faster E2E test creation with live application feedback
- AI can verify element selectors against the real DOM
- Screenshot comparison during test development
- Reduced manual effort for writing Page Object Models
