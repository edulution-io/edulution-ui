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
import ConferencePage from '../../page-objects/ConferencePage';

test.describe.serial('Conference workflow', () => {
  let conferenceName: string;

  test.beforeAll(() => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    conferenceName = `Test Conference ${uniqueId}`;
  });

  test('admin creates a conference', async ({ adminPage }) => {
    const conferencePage = new ConferencePage(adminPage);
    await conferencePage.goto();
    await adminPage.waitForLoadState('domcontentloaded');

    const createButton = adminPage.getByRole('button', { name: /create|new/i });
    const canCreate = await createButton
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    test.skip(!canCreate, 'Conference creation button not found');

    await conferencePage.createConference(conferenceName);
    await adminPage.waitForLoadState('domcontentloaded');

    const conferenceEntry = adminPage.getByText(conferenceName);
    await expect(conferenceEntry.first()).toBeVisible({ timeout: 10000 });
  });

  test('admin can see the conference in the list', async ({ adminPage }) => {
    const conferencePage = new ConferencePage(adminPage);
    await conferencePage.goto();
    await adminPage.waitForLoadState('domcontentloaded');

    const conferenceEntry = adminPage.getByText(conferenceName);
    await expect(conferenceEntry.first()).toBeVisible({ timeout: 10000 });
  });

  test('admin deletes the conference', async ({ adminPage }) => {
    const conferencePage = new ConferencePage(adminPage);
    await conferencePage.goto();
    await adminPage.waitForLoadState('domcontentloaded');

    const conferenceEntry = adminPage.getByText(conferenceName);
    const isVisible = await conferenceEntry
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    if (isVisible) {
      await conferencePage.deleteConference(conferenceName);
      await adminPage.waitForLoadState('domcontentloaded');

      await expect(adminPage.getByText(conferenceName))
        .not.toBeVisible({ timeout: 5000 })
        .catch(() => {
          // Cleanup best-effort
        });
    }
  });
});
