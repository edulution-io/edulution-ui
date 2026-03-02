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

  async navigateToMail(): Promise<void> {
    await this.page.getByRole('link', { name: /mail/i }).click();
    await this.page.waitForURL('**/mail**');
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
      .isVisible({ timeout: 500 })
      .catch(() => false);
    if (isVisible) {
      await closeButton.first().click();
      await closeButton
        .first()
        .waitFor({ state: 'hidden', timeout: 2000 })
        .catch(() => {});
    }
  }

  async logout(): Promise<void> {
    await this.dismissDialogs();
    const userMenuTrigger = this.page
      .locator('[key="usermenu"]')
      .or(this.page.locator('img[alt*="avatar" i]'))
      .or(this.page.getByRole('img').last());
    await userMenuTrigger.click();
    const logoutItem = this.page.getByRole('menuitem', { name: /logout|abmelden/i });
    await logoutItem.click({ force: true });
    await this.page.waitForURL('**/login**', { waitUntil: 'commit' }).catch(() => {});
  }
}

export default SidebarNav;
