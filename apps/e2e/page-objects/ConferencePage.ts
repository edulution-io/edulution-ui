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

const FLOATING_BUTTON_TIMEOUT = 10_000;

class ConferencePage extends BasePage {
  async goto(): Promise<void> {
    await this.navigateTo('/conferences');
    await this.page.waitForLoadState('load').catch(() => {});
  }

  private floatingButton(pattern: RegExp) {
    return this.page.locator('button').filter({ has: this.page.getByLabel(pattern) });
  }

  async isCreateButtonVisible(): Promise<boolean> {
    return this.floatingButton(/erstellen|create/i)
      .first()
      .isVisible({ timeout: FLOATING_BUTTON_TIMEOUT })
      .catch(() => false);
  }

  async createConference(name: string): Promise<void> {
    await this.dismissOverlays();
    await this.floatingButton(/erstellen|create/i)
      .first()
      .click();

    const dialog = this.page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible', timeout: 15_000 });

    await dialog.getByLabel(/name/i).first().fill(name);
    await dialog.getByRole('button', { name: /speichern|save/i }).click();
    await dialog.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
  }

  async isConferenceVisible(name: string): Promise<boolean> {
    return this.page
      .getByText(name)
      .first()
      .isVisible({ timeout: 10_000 })
      .catch(() => false);
  }

  async selectConference(name: string): Promise<void> {
    await this.page.getByText(name).first().click();
  }

  async deleteSelectedConferences(): Promise<void> {
    await this.dismissOverlays();
    await this.floatingButton(/löschen|delete/i)
      .first()
      .click();

    const dialog = this.page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible', timeout: 15_000 });

    await dialog.getByRole('button', { name: /löschen|delete/i }).click();
    await dialog.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
  }
}

export default ConferencePage;
