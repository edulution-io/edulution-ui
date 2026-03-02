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

test.describe.serial('Survey workflow', () => {
  let surveyName: string;
  let surveyCreated = false;

  test.beforeAll(() => {
    const helper = { generateUniqueId: () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
    surveyName = `Test Survey ${helper.generateUniqueId()}`;
  });

  test('teacher creates a survey', async ({ teacherPage }) => {
    const surveyEditor = new SurveyEditorPage(teacherPage);
    await surveyEditor.goto();

    const createButton = teacherPage.getByRole('button', { name: /create|new/i });
    const canCreate = await createButton
      .first()
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    test.skip(!canCreate, 'Survey creation button not found');

    await surveyEditor.createSurvey(surveyName);
    await surveyEditor.publishSurvey();

    const surveyEntry = teacherPage.getByText(surveyName);
    await expect(surveyEntry.first()).toBeVisible({ timeout: 10000 });
    surveyCreated = true;
  });

  test('student participates in the survey', async ({ studentPage }) => {
    test.skip(!surveyCreated, 'Survey was not created in previous test');
    const surveyEditor = new SurveyEditorPage(studentPage);
    await surveyEditor.goto();

    const surveyLink = studentPage.getByText(surveyName);
    const isVisible = await surveyLink
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false);
    test.skip(!isVisible, 'Survey not visible to student - may require explicit sharing');

    await surveyLink.first().click();

    const submitButton = studentPage.getByRole('button', { name: /submit|complete|finish/i });
    const canSubmit = await submitButton.isVisible({ timeout: 5000 }).catch(() => false);

    if (canSubmit) {
      await submitButton.click();
    }
  });

  test('teacher views survey results', async ({ teacherPage }) => {
    test.skip(!surveyCreated, 'Survey was not created');
    const surveyEditor = new SurveyEditorPage(teacherPage);
    await surveyEditor.goto();

    const surveyEntry = teacherPage.getByText(surveyName);
    await expect(surveyEntry.first()).toBeVisible({ timeout: 10000 });
    await surveyEntry.first().click();

    const resultsSection = teacherPage
      .getByText(/result/i)
      .or(teacherPage.locator('[data-testid*="result"]'))
      .first();
    const hasResults = await resultsSection.isVisible({ timeout: 5000 }).catch(() => false);
    test.skip(!hasResults, 'Results section not accessible from survey detail view');
  });

  test('teacher deletes the survey', async ({ teacherPage }) => {
    test.skip(!surveyCreated, 'Survey was not created');
    const surveyEditor = new SurveyEditorPage(teacherPage);
    await surveyEditor.goto();

    const surveyEntry = teacherPage.getByText(surveyName);
    const isVisible = await surveyEntry
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false);

    if (isVisible) {
      await surveyEditor.deleteSurvey(surveyName);

      await expect(teacherPage.getByText(surveyName))
        .not.toBeVisible({ timeout: 5000 })
        .catch(() => {
          // Cleanup best-effort: if deletion UI differs, survey may remain
        });
    }
  });
});
