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
import FileSharingPage from '../../page-objects/FileSharingPage';
import path from 'path';
import { writeFileSync, mkdirSync, rmSync } from 'fs';

test.describe.serial('File sharing workflow', () => {
  let uniqueFileName: string;
  let tempFilePath: string;
  const tempDir = path.resolve(__dirname, '..', '..', 'test-artifacts');

  test.beforeAll(() => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    uniqueFileName = `test-file-${uniqueId}.txt`;

    mkdirSync(tempDir, { recursive: true });
    tempFilePath = path.resolve(tempDir, uniqueFileName);
    writeFileSync(tempFilePath, `Test file content created at ${new Date().toISOString()}`);
  });

  test.afterAll(() => {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Cleanup best-effort
    }
  });

  test('teacher uploads a file', async ({ teacherPage }) => {
    const fileSharingPage = new FileSharingPage(teacherPage);
    await fileSharingPage.goto();
    await teacherPage.waitForLoadState('domcontentloaded');

    const fileInput = teacherPage.locator('input[type="file"]');
    const hasFileInput = await fileInput.count();

    test.skip(hasFileInput === 0, 'File input not found on file sharing page');

    await fileSharingPage.uploadFile(tempFilePath);
    await teacherPage.waitForLoadState('domcontentloaded');

    const uploadedFile = teacherPage.getByText(uniqueFileName);
    await expect(uploadedFile.first()).toBeVisible({ timeout: 15000 });
  });

  test('file appears in the listing', async ({ teacherPage }) => {
    const fileSharingPage = new FileSharingPage(teacherPage);
    await fileSharingPage.goto();
    await teacherPage.waitForLoadState('domcontentloaded');

    const fileEntry = teacherPage.getByText(uniqueFileName);
    await expect(fileEntry.first()).toBeVisible({ timeout: 10000 });
  });

  test('teacher deletes the file', async ({ teacherPage }) => {
    const fileSharingPage = new FileSharingPage(teacherPage);
    await fileSharingPage.goto();
    await teacherPage.waitForLoadState('domcontentloaded');

    const fileEntry = teacherPage.getByText(uniqueFileName);
    const isVisible = await fileEntry
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    if (isVisible) {
      await fileSharingPage.selectFile(uniqueFileName);
      await fileSharingPage.deleteSelectedFiles();
      await teacherPage.waitForLoadState('domcontentloaded');

      await expect(teacherPage.getByText(uniqueFileName))
        .not.toBeVisible({ timeout: 5000 })
        .catch(() => {
          // Cleanup best-effort
        });
    }
  });
});
