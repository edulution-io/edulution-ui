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

import { type Page, type Locator } from '@playwright/test';

abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigateTo(path: string): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' }).catch(() => {});
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async dismissOverlays(): Promise<void> {
    const closeBtn = this.page.getByRole('button', { name: /close|schließen|ok|verstanden/i }).first();
    const canClose = await closeBtn.isVisible({ timeout: 2_000 }).catch(() => false);
    if (canClose) {
      await closeBtn.click({ force: true }).catch(() => {});
      await this.page.waitForTimeout(500);
    }

    await this.page
      .evaluate(() => {
        document.querySelectorAll('[data-state="open"][aria-hidden="true"]').forEach((el) => el.remove());
        document.querySelectorAll('.fixed.inset-0').forEach((el) => {
          if (el.getAttribute('aria-hidden') === 'true' || el.querySelector('[role="dialog"]')) {
            el.remove();
          }
        });
      })
      .catch(() => {});
  }

  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  generateUniqueId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

export default BasePage;
