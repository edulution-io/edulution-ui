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

import { test as base, type Page } from '@playwright/test';
import path from 'path';

type AuthFixtures = {
  adminPage: Page;
  teacherPage: Page;
  studentPage: Page;
  parentPage: Page;
};

export const test = base.extend<AuthFixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.resolve(__dirname, '../auth/admin.storageState.json'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  teacherPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.resolve(__dirname, '../auth/teacher.storageState.json'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  studentPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.resolve(__dirname, '../auth/student.storageState.json'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  parentPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.resolve(__dirname, '../auth/parent.storageState.json'),
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
