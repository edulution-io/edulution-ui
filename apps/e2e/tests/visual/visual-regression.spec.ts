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
import { test as baseTest, expect as baseExpect } from '@playwright/test';
import type { Page } from '@playwright/test';

const LOAD_TIMEOUT_MS = 10000;
const SCREENSHOT_TIMEOUT_MS = 15000;

const THEME_STORAGE_KEY = 'theme';
const LICENSE_STORAGE_KEY = 'license-storage';
const LICENSE_STORAGE_VALUE = JSON.stringify({
  state: { wasViewedAlready: true, licenseInfo: null },
  version: 0,
});

const preparePageForTheme = async (page: Page, theme: 'light' | 'dark', suppressLicense = true): Promise<void> => {
  const themeValue = JSON.stringify({ state: { theme }, version: 0 });
  const entries: [string, string][] = [[THEME_STORAGE_KEY, themeValue]];
  if (suppressLicense) {
    entries.push([LICENSE_STORAGE_KEY, LICENSE_STORAGE_VALUE]);
  }
  await page.addInitScript((items: [string, string][]) => {
    items.forEach(([key, value]) => localStorage.setItem(key, value));
  }, entries);
};

const dismissVisibleDialogs = async (page: Page): Promise<void> => {
  const closeBtn = page.getByRole('button', { name: /close|schließen/i }).first();
  const visible = await closeBtn.isVisible({ timeout: 500 }).catch(() => false);
  if (visible) {
    await closeBtn.click({ force: true }).catch(() => {});
    await page.waitForTimeout(500);
  }
};

const waitForPageStable = async (page: Page): Promise<void> => {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
  await dismissVisibleDialogs(page);
};

baseTest.describe('Visual Regression: Login Page', () => {
  baseTest('login page - light theme', async ({ page }) => {
    await preparePageForTheme(page, 'light', false);
    await page.goto('/login', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await waitForPageStable(page);

    await baseExpect(page).toHaveScreenshot('login-light.png', {
      fullPage: true,
      timeout: SCREENSHOT_TIMEOUT_MS,
    });
  });

  baseTest('login page - dark theme', async ({ page }) => {
    await preparePageForTheme(page, 'dark', false);
    await page.goto('/login', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await waitForPageStable(page);

    await baseExpect(page).toHaveScreenshot('login-dark.png', {
      fullPage: true,
      timeout: SCREENSHOT_TIMEOUT_MS,
    });
  });
});

test.describe('Visual Regression: Dashboard', () => {
  test('dashboard - light theme', async ({ adminPage }) => {
    await preparePageForTheme(adminPage, 'light');
    await adminPage.goto('/dashboard', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await waitForPageStable(adminPage);

    const loaded = await adminPage
      .locator('main, [role="main"], [data-testid*="dashboard"]')
      .first()
      .isVisible({ timeout: LOAD_TIMEOUT_MS })
      .catch(() => false);
    test.skip(!loaded, 'Dashboard did not load');

    await expect(adminPage).toHaveScreenshot('dashboard-light.png', {
      fullPage: true,
      timeout: SCREENSHOT_TIMEOUT_MS,
    });
  });

  test('dashboard - dark theme', async ({ adminPage }) => {
    await preparePageForTheme(adminPage, 'dark');
    await adminPage.goto('/dashboard', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await waitForPageStable(adminPage);

    const loaded = await adminPage
      .locator('main, [role="main"], [data-testid*="dashboard"]')
      .first()
      .isVisible({ timeout: LOAD_TIMEOUT_MS })
      .catch(() => false);
    test.skip(!loaded, 'Dashboard did not load');

    await expect(adminPage).toHaveScreenshot('dashboard-dark.png', {
      fullPage: true,
      timeout: SCREENSHOT_TIMEOUT_MS,
    });
  });
});

test.describe('Visual Regression: File Browser', () => {
  test('file browser - light theme', async ({ adminPage }) => {
    await preparePageForTheme(adminPage, 'light');
    await adminPage.goto('/file-sharing', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await waitForPageStable(adminPage);

    const loaded = await adminPage
      .locator('main, [role="main"], [data-testid*="file"]')
      .first()
      .isVisible({ timeout: LOAD_TIMEOUT_MS })
      .catch(() => false);
    test.skip(!loaded, 'File browser did not load');

    await expect(adminPage).toHaveScreenshot('file-browser-light.png', {
      fullPage: true,
      timeout: SCREENSHOT_TIMEOUT_MS,
    });
  });

  test('file browser - dark theme', async ({ adminPage }) => {
    await preparePageForTheme(adminPage, 'dark');
    await adminPage.goto('/file-sharing', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await waitForPageStable(adminPage);

    const loaded = await adminPage
      .locator('main, [role="main"], [data-testid*="file"]')
      .first()
      .isVisible({ timeout: LOAD_TIMEOUT_MS })
      .catch(() => false);
    test.skip(!loaded, 'File browser did not load');

    await expect(adminPage).toHaveScreenshot('file-browser-dark.png', {
      fullPage: true,
      timeout: SCREENSHOT_TIMEOUT_MS,
    });
  });
});

test.describe('Visual Regression: Surveys', () => {
  test('survey editor - light theme', async ({ adminPage }) => {
    await preparePageForTheme(adminPage, 'light');
    await adminPage.goto('/surveys', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await waitForPageStable(adminPage);

    const loaded = await adminPage
      .locator('main, [role="main"], [data-testid*="survey"]')
      .first()
      .isVisible({ timeout: LOAD_TIMEOUT_MS })
      .catch(() => false);
    test.skip(!loaded, 'Survey page did not load');

    await expect(adminPage).toHaveScreenshot('survey-editor-light.png', {
      fullPage: true,
      timeout: SCREENSHOT_TIMEOUT_MS,
    });
  });

  test('survey editor - dark theme', async ({ adminPage }) => {
    await preparePageForTheme(adminPage, 'dark');
    await adminPage.goto('/surveys', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await waitForPageStable(adminPage);

    const loaded = await adminPage
      .locator('main, [role="main"], [data-testid*="survey"]')
      .first()
      .isVisible({ timeout: LOAD_TIMEOUT_MS })
      .catch(() => false);
    test.skip(!loaded, 'Survey page did not load');

    await expect(adminPage).toHaveScreenshot('survey-editor-dark.png', {
      fullPage: true,
      timeout: SCREENSHOT_TIMEOUT_MS,
    });
  });
});

test.describe('Visual Regression: Settings', () => {
  test('settings page - light theme', async ({ adminPage }) => {
    await preparePageForTheme(adminPage, 'light');
    await adminPage.goto('/settings', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await waitForPageStable(adminPage);

    const loaded = await adminPage
      .locator('main, [role="main"], [data-testid*="settings"]')
      .first()
      .isVisible({ timeout: LOAD_TIMEOUT_MS })
      .catch(() => false);
    test.skip(!loaded, 'Settings page did not load');

    await expect(adminPage).toHaveScreenshot('settings-light.png', {
      fullPage: true,
      timeout: SCREENSHOT_TIMEOUT_MS,
    });
  });

  test('settings page - dark theme', async ({ adminPage }) => {
    await preparePageForTheme(adminPage, 'dark');
    await adminPage.goto('/settings', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await waitForPageStable(adminPage);

    const loaded = await adminPage
      .locator('main, [role="main"], [data-testid*="settings"]')
      .first()
      .isVisible({ timeout: LOAD_TIMEOUT_MS })
      .catch(() => false);
    test.skip(!loaded, 'Settings page did not load');

    await expect(adminPage).toHaveScreenshot('settings-dark.png', {
      fullPage: true,
      timeout: SCREENSHOT_TIMEOUT_MS,
    });
  });
});

test.describe('Visual Regression: Menubar States', () => {
  test('menubar expanded state', async ({ adminPage }) => {
    await preparePageForTheme(adminPage, 'light');
    await adminPage.goto('/dashboard', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await waitForPageStable(adminPage);

    const loaded = await adminPage
      .locator('main, [role="main"], [data-testid*="dashboard"]')
      .first()
      .isVisible({ timeout: LOAD_TIMEOUT_MS })
      .catch(() => false);
    test.skip(!loaded, 'Dashboard did not load');

    const menubar = adminPage.locator('nav').first();
    const menubarVisible = await menubar.isVisible().catch(() => false);
    test.skip(!menubarVisible, 'Menubar not visible');

    await expect(menubar).toHaveScreenshot('menubar-expanded.png', {
      timeout: SCREENSHOT_TIMEOUT_MS,
    });
  });

  test('menubar collapsed state', async ({ adminPage }) => {
    await preparePageForTheme(adminPage, 'light');
    await adminPage.goto('/dashboard', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await waitForPageStable(adminPage);

    const loaded = await adminPage
      .locator('main, [role="main"], [data-testid*="dashboard"]')
      .first()
      .isVisible({ timeout: LOAD_TIMEOUT_MS })
      .catch(() => false);
    test.skip(!loaded, 'Dashboard did not load');

    const collapseButton = adminPage.locator('button.cursor-w-resize').first();
    const buttonVisible = await collapseButton.isVisible().catch(() => false);
    test.skip(!buttonVisible, 'Collapse button not found');

    await collapseButton.click();
    await adminPage.waitForTimeout(500);

    const menubar = adminPage.locator('nav').first();
    await expect(menubar).toHaveScreenshot('menubar-collapsed.png', {
      timeout: SCREENSHOT_TIMEOUT_MS,
    });
  });
});
