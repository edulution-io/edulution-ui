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

class FileSharingPage extends BasePage {
  async goto(webdavShare?: string): Promise<void> {
    const path = webdavShare ? `/filesharing/${webdavShare}` : '/filesharing';
    await this.navigateTo(path);
  }

  async uploadFile(filePath: string): Promise<void> {
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
  }

  breadcrumb(): Locator {
    return this.getByTestId('directory-breadcrumb');
  }

  fileTable(): Locator {
    return this.getByTestId('file-sharing-table');
  }

  async selectFile(fileName: string): Promise<void> {
    await this.page.getByText(fileName).click();
  }

  async deleteSelectedFiles(): Promise<void> {
    await this.page.getByRole('button', { name: /delete/i }).click();
    await this.page.getByRole('button', { name: /confirm|yes/i }).click();
  }
}

export default FileSharingPage;
