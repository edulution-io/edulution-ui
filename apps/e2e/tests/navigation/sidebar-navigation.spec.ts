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
import SidebarNav from '../../page-objects/SidebarNav';

test.describe('Sidebar Navigation', () => {
  test('admin can navigate to surveys via sidebar', async ({ adminPage }) => {
    await adminPage.goto('/dashboard', { waitUntil: 'domcontentloaded' }).catch(() => {});

    const sidebarNav = new SidebarNav(adminPage);
    await sidebarNav.dismissDialogs();
    await sidebarNav.navigateToSurveys();

    await expect(adminPage).toHaveURL(/\/surveys/, { timeout: 10_000 });
  });

  test('admin can navigate to file sharing via sidebar', async ({ adminPage }) => {
    await adminPage.goto('/dashboard', { waitUntil: 'domcontentloaded' }).catch(() => {});

    const sidebarNav = new SidebarNav(adminPage);
    await sidebarNav.dismissDialogs();
    await sidebarNav.navigateToFileSharing();

    await expect(adminPage).toHaveURL(/\/filesharing/, { timeout: 10_000 });
  });

  test('admin can navigate to conferences via sidebar', async ({ adminPage }) => {
    await adminPage.goto('/dashboard', { waitUntil: 'domcontentloaded' }).catch(() => {});

    const sidebarNav = new SidebarNav(adminPage);
    await sidebarNav.dismissDialogs();
    await sidebarNav.navigateToConferences();

    await expect(adminPage).toHaveURL(/\/conferences/, { timeout: 10_000 });
  });

  test('admin can navigate to settings via sidebar', async ({ adminPage }) => {
    await adminPage.goto('/dashboard', { waitUntil: 'domcontentloaded' }).catch(() => {});

    const sidebarNav = new SidebarNav(adminPage);
    await sidebarNav.dismissDialogs();
    await sidebarNav.navigateToSettings();

    await expect(adminPage).toHaveURL(/\/settings/, { timeout: 10_000 });
  });
});
