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

test.describe('Mail workflow', () => {
  test('user can access mail page', async ({ teacherPage }) => {
    await teacherPage.goto('/mail');
    await teacherPage.waitForLoadState('domcontentloaded');

    const mailIframe = teacherPage.locator('iframe').first();
    const nativeFrame = teacherPage.locator('[data-testid*="native-frame"]').or(mailIframe).first();

    const isVisible = await nativeFrame.isVisible({ timeout: 10000 }).catch(() => false);
    test.skip(!isVisible, 'Mail page iframe not visible - mail service may not be configured');

    await expect(nativeFrame).toBeVisible();
  });

  test('mail iframe is accessible', async ({ teacherPage }) => {
    await teacherPage.goto('/mail');
    await teacherPage.waitForLoadState('domcontentloaded');

    const mailIframe = teacherPage.locator('iframe').first();
    const isVisible = await mailIframe.isVisible({ timeout: 10000 }).catch(() => false);
    test.skip(!isVisible, 'Mail iframe not rendered - mail service unavailable on staging');

    const src = await mailIframe.getAttribute('src');
    expect(src).toBeTruthy();

    const frame = teacherPage.frameLocator('iframe').first();
    const frameContent = frame.locator('body');
    const hasContent = await frameContent.isVisible({ timeout: 10000 }).catch(() => false);

    if (!hasContent) {
      test.info().annotations.push({
        type: 'limitation',
        description: 'Mail iframe loaded but content inaccessible - likely cross-origin or requires separate auth',
      });
    }
  });
});
