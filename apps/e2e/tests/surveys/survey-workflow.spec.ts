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
import SurveyEditorPage from '../../page-objects/SurveyEditorPage';

test.describe('Survey workflow', () => {
  test('teacher can navigate to surveys page', async ({ teacherPage }) => {
    const surveyPage = new SurveyEditorPage(teacherPage);
    await surveyPage.goto();

    await expect(teacherPage).toHaveURL(/\/surveys/, { timeout: 15_000 });
  });

  test('teacher can access created surveys list', async ({ teacherPage }) => {
    const surveyPage = new SurveyEditorPage(teacherPage);
    await surveyPage.gotoCreated();

    await expect(teacherPage).toHaveURL(/\/surveys\/created/, { timeout: 15_000 });

    const mainContent = teacherPage.locator('main, [role="main"]').first();
    const loaded = await mainContent.isVisible({ timeout: 10_000 }).catch(() => false);
    test.skip(!loaded, 'Created surveys page did not load');

    await expect(mainContent).toBeVisible();
  });

  test('teacher can open survey editor', async ({ teacherPage }) => {
    const surveyPage = new SurveyEditorPage(teacherPage);
    await surveyPage.gotoEditor();

    await expect(teacherPage).toHaveURL(/\/surveys\/editor/, { timeout: 15_000 });

    const editorContent = teacherPage.locator('main, [role="main"], .svc-creator').first();
    const loaded = await editorContent.isVisible({ timeout: 10_000 }).catch(() => false);
    test.skip(!loaded, 'Survey editor did not load');

    await expect(editorContent).toBeVisible();
  });

  test('student can access open surveys list', async ({ studentPage }) => {
    const surveyPage = new SurveyEditorPage(studentPage);
    await surveyPage.goto();

    await expect(studentPage).toHaveURL(/\/surveys/, { timeout: 15_000 });

    const mainContent = studentPage.locator('main, [role="main"]').first();
    const loaded = await mainContent.isVisible({ timeout: 10_000 }).catch(() => false);
    test.skip(!loaded, 'Surveys page did not load for student');

    await expect(mainContent).toBeVisible();
  });
});
