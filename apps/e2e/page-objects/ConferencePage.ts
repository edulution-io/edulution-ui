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

class ConferencePage extends BasePage {
  async goto(): Promise<void> {
    await this.navigateTo('/conferences');
  }

  async createConference(name: string): Promise<void> {
    await this.page.getByRole('button', { name: /create|new/i }).click();
    await this.page.getByRole('textbox', { name: /name|title/i }).fill(name);
    await this.page
      .getByRole('button', { name: /save|create/i })
      .last()
      .click();
  }

  async joinConference(name: string): Promise<void> {
    const row = this.page.getByText(name);
    await row.click();
    await this.page.getByRole('button', { name: /join/i }).click();
  }

  async deleteConference(name: string): Promise<void> {
    await this.page.getByText(name).click();
    await this.page.getByRole('button', { name: /delete/i }).click();
    await this.page.getByRole('button', { name: /confirm|yes/i }).click();
  }
}

export default ConferencePage;
