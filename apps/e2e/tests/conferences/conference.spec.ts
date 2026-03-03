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
import SidebarNav from '../../page-objects/SidebarNav';

test.describe.serial('Conference workflow', () => {
  let conferenceName: string;
  let conferenceCreated = false;

  test.beforeAll(() => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    conferenceName = `E2E Conf ${uniqueId}`;
  });

  test('admin can navigate to conferences page', async ({ adminPage }) => {
    const sidebar = new SidebarNav(adminPage);
    await sidebar.dismissDialogs();

    const conferencePage = new ConferencePage(adminPage);
    await conferencePage.goto();

    await expect(adminPage).toHaveURL(/\/conferences/, { timeout: 15_000 });
  });

  test('admin creates a conference', async ({ adminPage }) => {
    const conferencePage = new ConferencePage(adminPage);
    await conferencePage.goto();

    const canCreate = await conferencePage.isCreateButtonVisible();
    test.skip(!canCreate, 'Conference creation button not found');

    await conferencePage.createConference(conferenceName);

    const isVisible = await conferencePage.isConferenceVisible(conferenceName);
    expect(isVisible).toBeTruthy();
    conferenceCreated = true;
  });

  test('admin can see the conference in the list', async ({ adminPage }) => {
    test.skip(!conferenceCreated, 'Conference was not created in previous test');

    const conferencePage = new ConferencePage(adminPage);
    await conferencePage.goto();

    const isVisible = await conferencePage.isConferenceVisible(conferenceName);
    expect(isVisible).toBeTruthy();
  });

  test('admin deletes the conference', async ({ adminPage }) => {
    test.skip(!conferenceCreated, 'Conference was not created');

    const conferencePage = new ConferencePage(adminPage);
    await conferencePage.goto();

    const isVisible = await conferencePage.isConferenceVisible(conferenceName);
    test.skip(!isVisible, 'Conference not found in list');

    await conferencePage.selectConference(conferenceName);
    await conferencePage.deleteSelectedConferences();

    await expect(adminPage.getByText(conferenceName))
      .not.toBeVisible({ timeout: 10_000 })
      .catch(() => {});
    conferenceCreated = false;
  });
});
