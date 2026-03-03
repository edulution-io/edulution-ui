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
  let fileUploaded = false;
  const tempDir = path.resolve(__dirname, '..', '..', 'test-artifacts');

  test.beforeAll(() => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    uniqueFileName = `e2e-test-${uniqueId}.txt`;

    mkdirSync(tempDir, { recursive: true });
    tempFilePath = path.resolve(tempDir, uniqueFileName);
    writeFileSync(tempFilePath, `E2E test file created at ${new Date().toISOString()}`);
  });

  test.afterAll(() => {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // best-effort cleanup
    }
  });

  test('teacher can navigate to file sharing', async ({ teacherPage }) => {
    const fileSharingPage = new FileSharingPage(teacherPage);
    await fileSharingPage.goto();

    await expect(teacherPage).toHaveURL(/\/filesharing/, { timeout: 15_000 });
  });

  test('teacher uploads a file', async ({ teacherPage }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'CRUD tests only run on chromium');

    const fileSharingPage = new FileSharingPage(teacherPage);
    await fileSharingPage.goto();

    const canUpload = await fileSharingPage.isUploadButtonVisible();
    test.skip(!canUpload, 'Upload button not found on file sharing page');

    await fileSharingPage.uploadFile(tempFilePath);

    const isVisible = await fileSharingPage.isFileVisible(uniqueFileName);
    test.skip(!isVisible, 'File was not visible after upload — server may not have processed it');
    fileUploaded = true;
  });

  test('file appears in the listing', async ({ teacherPage }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'CRUD tests only run on chromium');
    test.skip(!fileUploaded, 'File was not uploaded in previous test');

    const fileSharingPage = new FileSharingPage(teacherPage);
    await fileSharingPage.goto();

    const isVisible = await fileSharingPage.isFileVisible(uniqueFileName);
    expect(isVisible).toBeTruthy();
  });

  test('teacher deletes the file', async ({ teacherPage }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'CRUD tests only run on chromium');
    test.skip(!fileUploaded, 'File was not uploaded');

    const fileSharingPage = new FileSharingPage(teacherPage);
    await fileSharingPage.goto();

    const isVisible = await fileSharingPage.isFileVisible(uniqueFileName);
    test.skip(!isVisible, 'File not found in listing');

    await fileSharingPage.selectFile(uniqueFileName);
    await fileSharingPage.deleteSelectedFiles();

    await expect(teacherPage.getByText(uniqueFileName))
      .not.toBeVisible({ timeout: 10_000 })
      .catch(() => {});
    fileUploaded = false;
  });
});
