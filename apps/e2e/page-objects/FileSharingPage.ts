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

import { type Locator } from '@playwright/test';
import BasePage from './BasePage';

const FLOATING_BUTTON_TIMEOUT = 10_000;

class FileSharingPage extends BasePage {
  async goto(webdavShare?: string): Promise<void> {
    const pagePath = webdavShare ? `/filesharing/${webdavShare}` : '/filesharing';
    await this.navigateTo(pagePath);
    await this.page.waitForLoadState('load').catch(() => {});
  }

  private floatingButton(label: string) {
    return this.page.locator('button').filter({ has: this.page.locator(`[aria-label="${label}"]`) });
  }

  breadcrumb(): Locator {
    return this.getByTestId('directory-breadcrumb');
  }

  fileTable(): Locator {
    return this.getByTestId('file-sharing-table');
  }

  async isUploadButtonVisible(): Promise<boolean> {
    return this.floatingButton('Hochladen')
      .first()
      .isVisible({ timeout: FLOATING_BUTTON_TIMEOUT })
      .catch(() => false);
  }

  async uploadFile(filePath: string): Promise<void> {
    await this.floatingButton('Hochladen').first().click();

    const dialog = this.page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible', timeout: 5000 });

    const fileInput = dialog.locator('input[type="file"]').first();
    await fileInput.setInputFiles(filePath);

    await dialog.getByRole('button', { name: /hochladen/i }).click();
    await dialog.waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {});
  }

  async isFileVisible(fileName: string): Promise<boolean> {
    return this.page
      .getByText(fileName)
      .first()
      .isVisible({ timeout: 10_000 })
      .catch(() => false);
  }

  async selectFile(fileName: string): Promise<void> {
    await this.page.getByText(fileName).first().click();
  }

  async deleteSelectedFiles(): Promise<void> {
    await this.floatingButton('Löschen').first().click();

    const dialog = this.page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible', timeout: 5000 });

    await dialog.getByRole('button', { name: /fortfahren/i }).click();
    await dialog.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
  }

  async createFolder(name: string): Promise<void> {
    await this.floatingButton('Ordner erstellen').first().click();

    const dialog = this.page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible', timeout: 5000 });

    await dialog.locator('input').first().fill(name);
    await dialog.getByRole('button', { name: /erstellen/i }).click();
    await dialog.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {});
  }
}

export default FileSharingPage;
