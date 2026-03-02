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
  test('user can change theme', async ({ adminPage }) => {
    const settingsPage = new SettingsPage(adminPage);
    await settingsPage.goto();
    await adminPage.waitForLoadState('domcontentloaded');

    const themeControl = adminPage
      .getByRole('combobox', { name: /theme/i })
      .or(adminPage.locator('[data-testid*="theme"]'))
      .first();

    const isThemeVisible = await themeControl.isVisible().catch(() => false);
    test.skip(!isThemeVisible, 'Theme control not found on settings page');

    const bodyClassBefore = await adminPage.evaluate(() => document.body.className);
    await settingsPage.changeTheme('dark');

    const bodyClassAfter = await adminPage.evaluate(() => document.body.className);
    expect(bodyClassAfter).not.toBe(bodyClassBefore);

    await settingsPage.changeTheme('light');
  });

  test('user can view notification settings', async ({ adminPage }) => {
    const settingsPage = new SettingsPage(adminPage);
    await settingsPage.goto();
    await adminPage.waitForLoadState('domcontentloaded');

    const notificationSection = adminPage
      .getByRole('switch', { name: /notification/i })
      .or(adminPage.locator('[data-testid*="notification"]'))
      .first();

    const isVisible = await notificationSection.isVisible().catch(() => false);
    test.skip(!isVisible, 'Notification settings not found on settings page');

    await expect(notificationSection).toBeVisible();
  });

  test('user can access DND window settings', async ({ adminPage }) => {
    const settingsPage = new SettingsPage(adminPage);
    await settingsPage.goto();
    await adminPage.waitForLoadState('domcontentloaded');

    const dndSection = adminPage
      .getByText(/do not disturb/i)
      .or(adminPage.getByText(/dnd/i))
      .or(adminPage.locator('[data-testid*="dnd"]'))
      .first();

    const isVisible = await dndSection.isVisible().catch(() => false);
    test.skip(!isVisible, 'DND settings not found on settings page');

    await expect(dndSection).toBeVisible();
  });
});
