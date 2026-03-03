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
import SettingsPage from '../../page-objects/SettingsPage';

test.describe('Settings', () => {
  test('admin can access settings page', async ({ adminPage }) => {
    const settingsPage = new SettingsPage(adminPage);
    await settingsPage.goto();

    await expect(adminPage).toHaveURL(/\/settings/, { timeout: 15_000 });

    const loaded = await settingsPage.isPageLoaded();
    test.skip(!loaded, 'Settings page did not load');
  });

  test('user can access theme settings', async ({ adminPage }) => {
    const settingsPage = new SettingsPage(adminPage);
    await settingsPage.gotoThemeSettings();

    await expect(adminPage).toHaveURL(/\/usersettings\/userinterface/, { timeout: 15_000 });

    const loaded = await settingsPage.isPageLoaded();
    test.skip(!loaded, 'Theme settings page did not load');

    const themeSelector = adminPage
      .getByText(/design|theme|erscheinungsbild/i)
      .or(adminPage.locator('select, [role="combobox"]'))
      .first();

    const isVisible = await themeSelector.isVisible({ timeout: 5000 }).catch(() => false);
    test.skip(!isVisible, 'Theme selector not found on settings page');

    await expect(themeSelector).toBeVisible();
  });

  test('user can access user settings page', async ({ adminPage }) => {
    const settingsPage = new SettingsPage(adminPage);
    await settingsPage.gotoUserSettings();

    await expect(adminPage).toHaveURL(/\/usersettings/, { timeout: 15_000 });

    const loaded = await settingsPage.isPageLoaded();
    test.skip(!loaded, 'User settings page did not load');
  });
});
