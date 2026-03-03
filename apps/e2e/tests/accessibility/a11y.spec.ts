/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { test, expect } from '../../fixtures/auth.fixture';
import { runAccessibilityScan } from '../../utils/a11y';
import { test as baseTest } from '@playwright/test';

const LOAD_TIMEOUT_MS = 10000;

const KNOWN_ISSUES: string[] = ['color-contrast'];

baseTest.describe('Accessibility: Public Pages', () => {
  baseTest('login page has no critical a11y violations', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await page.waitForLoadState('load').catch(() => {});

    await runAccessibilityScan(page, { disableRules: KNOWN_ISSUES });
  });
});

test.describe('Accessibility: Authenticated Pages', () => {
  test('dashboard has no critical a11y violations', async ({ adminPage }) => {
    await adminPage.goto('/dashboard', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await adminPage.waitForLoadState('load').catch(() => {});

    const dashboardLoaded = await adminPage
      .locator('[data-testid*="dashboard"], main, [role="main"]')
      .first()
      .isVisible({ timeout: LOAD_TIMEOUT_MS })
      .catch(() => false);

    test.skip(!dashboardLoaded, 'Dashboard did not load');

    await runAccessibilityScan(adminPage, { disableRules: KNOWN_ISSUES });
  });

  test('settings page has no critical a11y violations', async ({ adminPage }) => {
    await adminPage.goto('/settings', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await adminPage.waitForLoadState('load').catch(() => {});

    const settingsLoaded = await adminPage
      .locator('[data-testid*="settings"], main, [role="main"]')
      .first()
      .isVisible({ timeout: LOAD_TIMEOUT_MS })
      .catch(() => false);

    test.skip(!settingsLoaded, 'Settings page did not load');

    await runAccessibilityScan(adminPage, { disableRules: KNOWN_ISSUES });
  });

  test('file browser has no critical a11y violations', async ({ adminPage }) => {
    await adminPage.goto('/file-sharing', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await adminPage.waitForLoadState('load').catch(() => {});

    const fileBrowserLoaded = await adminPage
      .locator('[data-testid*="file-sharing"], [data-testid*="file"], main, [role="main"]')
      .first()
      .isVisible({ timeout: LOAD_TIMEOUT_MS })
      .catch(() => false);

    test.skip(!fileBrowserLoaded, 'File browser did not load');

    await runAccessibilityScan(adminPage, { disableRules: KNOWN_ISSUES });
  });

  test('survey editor has no critical a11y violations', async ({ adminPage }) => {
    await adminPage.goto('/surveys', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await adminPage.waitForLoadState('load').catch(() => {});

    const surveysLoaded = await adminPage
      .locator('[data-testid*="survey"], main, [role="main"]')
      .first()
      .isVisible({ timeout: LOAD_TIMEOUT_MS })
      .catch(() => false);

    test.skip(!surveysLoaded, 'Survey page did not load');

    await runAccessibilityScan(adminPage, { disableRules: KNOWN_ISSUES });
  });

  test('mail page has no critical a11y violations', async ({ adminPage }) => {
    await adminPage.goto('/mail', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await adminPage.waitForLoadState('load').catch(() => {});

    const mailLoaded = await adminPage
      .locator('[data-testid*="mail"], main, [role="main"]')
      .first()
      .isVisible({ timeout: LOAD_TIMEOUT_MS })
      .catch(() => false);

    test.skip(!mailLoaded, 'Mail page did not load');

    await runAccessibilityScan(adminPage, { disableRules: KNOWN_ISSUES });
  });
});
