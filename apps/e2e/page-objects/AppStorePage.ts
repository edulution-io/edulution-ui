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

class AppStorePage extends BasePage {
  async goto(): Promise<void> {
    await this.navigateTo('/settings');
  }

  async browseApps(): Promise<string[]> {
    const appElements = this.page.locator('[data-testid*="app-"]');
    const count = await appElements.count();
    const apps: string[] = [];

    for (let i = 0; i < count; i++) {
      const text = await appElements.nth(i).textContent();
      if (text) {
        apps.push(text);
      }
    }

    return apps;
  }

  async installApp(appName: string): Promise<void> {
    await this.page.getByText(appName).click();
    await this.page.getByRole('button', { name: /install|enable/i }).click();
  }

  async configureApp(appName: string): Promise<void> {
    await this.page.getByText(appName).click();
    await this.page.getByRole('button', { name: /configure|settings/i }).click();
  }
}

export default AppStorePage;
