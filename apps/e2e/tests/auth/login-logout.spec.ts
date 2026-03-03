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

import { type Page } from '@playwright/test';
import { test, expect } from '../../fixtures/auth.fixture';
import LoginPage from '../../page-objects/LoginPage';
import SidebarNav from '../../page-objects/SidebarNav';

const gracefulGoto = async (page: Page, path: string): Promise<void> => {
  await page.goto(path, { waitUntil: 'domcontentloaded' }).catch(() => {});
};

test.describe('Login and Logout', () => {
  test('admin can login via form', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const loginPage = new LoginPage(page);

    const username = process.env.E2E_ADMIN_USER;
    const password = process.env.E2E_ADMIN_PASS;

    test.skip(!username || !password, 'Admin credentials not configured');

    await loginPage.goto();
    await loginPage.loginAs(username!, password!);

    await expect(page).toHaveURL(/\/dashboard/);

    await context.close();
  });

  test('authenticated admin can access dashboard', async ({ adminPage }) => {
    await gracefulGoto(adminPage, '/dashboard');
    await adminPage.waitForLoadState('load').catch(() => {});
    await expect(adminPage).toHaveURL(/\/dashboard/, { timeout: 20_000 });

    const mainContent = adminPage.locator('main, [role="main"], nav').first();
    await expect(mainContent).toBeVisible({ timeout: 10_000 });
  });

  test('user can logout', async ({ adminPage }) => {
    await gracefulGoto(adminPage, '/dashboard');

    const sidebarNav = new SidebarNav(adminPage);
    await sidebarNav.logout();

    await expect(adminPage).toHaveURL(/\/login/);
  });

  test('unauthenticated user is redirected to login', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await gracefulGoto(page, '/dashboard');
    await page.waitForLoadState('load').catch(() => {});

    await expect(page).toHaveURL(/\/login/, { timeout: 20_000 });

    await context.close();
  });
});
