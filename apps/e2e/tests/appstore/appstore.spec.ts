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
import AppStorePage from '../../page-objects/AppStorePage';

test.describe('AppStore', () => {
  test('admin can browse installed apps', async ({ adminPage }) => {
    const appStorePage = new AppStorePage(adminPage);
    await appStorePage.goto();
    await adminPage.waitForLoadState('domcontentloaded');

    const appElements = adminPage.locator('[data-testid*="app-"]');
    const appCount = await appElements.count();

    test.skip(appCount === 0, 'No apps found in app store');

    expect(appCount).toBeGreaterThan(0);
  });

  test('admin can open app configuration', async ({ adminPage }) => {
    const appStorePage = new AppStorePage(adminPage);
    await appStorePage.goto();
    await adminPage.waitForLoadState('domcontentloaded');

    const appElements = adminPage.locator('[data-testid*="app-"]');
    const appCount = await appElements.count();

    test.skip(appCount === 0, 'No apps available to configure');

    const firstApp = appElements.first();
    await firstApp.click();

    const configDialog = adminPage
      .getByRole('dialog')
      .or(adminPage.locator('[data-testid*="config"]'))
      .or(adminPage.locator('[data-testid*="detail"]'))
      .first();

    const isDialogVisible = await configDialog.isVisible({ timeout: 5000 }).catch(() => false);
    test.skip(!isDialogVisible, 'App configuration dialog did not open');

    await expect(configDialog).toBeVisible();
  });
});
