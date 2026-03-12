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

import BasePage from './BasePage';

class SidebarNav extends BasePage {
  async navigateToSurveys(): Promise<void> {
    await this.page.getByRole('link', { name: /survey/i }).click();
    await this.page.waitForURL('**/surveys**');
  }

  async navigateToFileSharing(): Promise<void> {
    await this.page.getByRole('link', { name: /file/i }).click();
    await this.page.waitForURL('**/filesharing**');
  }

  async navigateToConferences(): Promise<void> {
    await this.page.getByRole('link', { name: /conference/i }).click();
    await this.page.waitForURL('**/conferences**');
  }

  async navigateToSettings(): Promise<void> {
    await this.page.getByRole('link', { name: /settings/i }).click();
    await this.page.waitForURL('**/settings**');
  }

  async dismissDialogs(): Promise<void> {
    const closeButton = this.page.getByRole('button', { name: /close|schließen/i });
    const isVisible = await closeButton
      .first()
      .waitFor({ state: 'visible', timeout: 2_000 })
      .then(() => true)
      .catch(() => false);

    if (isVisible) {
      await closeButton.first().click();
      await this.page
        .getByRole('dialog')
        .first()
        .waitFor({ state: 'hidden', timeout: 3_000 })
        .catch(() => {});
    }
  }

  async logout(): Promise<void> {
    await this.dismissDialogs();

    const userMenuTrigger = this.page.locator('[aria-haspopup="menu"]').last();
    await userMenuTrigger.waitFor({ state: 'visible', timeout: 10_000 });
    await userMenuTrigger.click({ timeout: 5_000 });

    const logoutItem = this.page.getByRole('menuitem', { name: /logout|abmelden/i });
    await logoutItem.waitFor({ state: 'visible', timeout: 5_000 });
    await logoutItem.click({ timeout: 5_000 });

    await this.page.waitForURL('**/login**', { timeout: 20_000 });
  }
}

export default SidebarNav;
