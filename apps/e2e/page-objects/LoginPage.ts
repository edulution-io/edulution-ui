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

class LoginPage extends BasePage {
  async goto(): Promise<void> {
    await this.navigateTo('/login');
  }

  usernameInput(): Locator {
    return this.getByTestId('test-id-login-page-username-input');
  }

  passwordInput(): Locator {
    return this.getByTestId('test-id-login-page-password-input');
  }

  submitButton(): Locator {
    return this.getByTestId('test-id-login-page-submit-button');
  }

  qrCodeButton(): Locator {
    return this.getByTestId('test-id-login-page-qr-button');
  }

  async loginAs(username: string, password: string): Promise<void> {
    await this.usernameInput().fill(username);
    await this.passwordInput().fill(password);
    await this.submitButton().click();
    await this.page.waitForURL('**/dashboard/**');
  }

  async expectOnLoginPage(): Promise<void> {
    await this.page.waitForURL('**/login**');
  }
}

export default LoginPage;
