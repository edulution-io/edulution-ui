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

import { chromium, type FullConfig } from '@playwright/test';
import dotenv from 'dotenv';
import { mkdirSync, existsSync } from 'fs';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.e2e') });

const AUTH_DIR = path.resolve(__dirname, 'auth');
const LOGIN_TIMEOUT_MS = 30_000;

const ROLES = ['admin', 'teacher', 'student', 'parent'] as const;

type Role = (typeof ROLES)[number];

const getCredentials = (role: Role): { user: string; pass: string } | null => {
  const userKey = `E2E_${role.toUpperCase()}_USER`;
  const passKey = `E2E_${role.toUpperCase()}_PASS`;
  const user = process.env[userKey];
  const pass = process.env[passKey];

  if (!user || !pass) {
    console.warn(`[global-setup] Missing credentials for role "${role}" (${userKey}/${passKey}). Skipping.`);
    return null;
  }

  return { user, pass };
};

const authenticateRole = async (role: Role, baseURL: string): Promise<void> => {
  const credentials = getCredentials(role);
  if (!credentials) return;

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(`${baseURL}/login`, { timeout: LOGIN_TIMEOUT_MS });

    await page.getByTestId('test-id-login-page-username-input').fill(credentials.user);
    await page.getByTestId('test-id-login-page-password-input').fill(credentials.pass);
    await page.getByTestId('test-id-login-page-submit-button').click();

    await page.waitForURL('**/dashboard/**', { timeout: LOGIN_TIMEOUT_MS });

    const storageStatePath = path.resolve(AUTH_DIR, `${role}.storageState.json`);
    await context.storageState({ path: storageStatePath });

    console.log(`[global-setup] Authenticated role "${role}" -> ${storageStatePath}`);
  } catch (error) {
    console.error(`[global-setup] Failed to authenticate role "${role}":`, error);
  } finally {
    await browser.close();
  }
};

const globalSetup = async (_config: FullConfig): Promise<void> => {
  const baseURL = process.env.E2E_BASE_URL || 'http://localhost:5173';

  if (!existsSync(AUTH_DIR)) {
    mkdirSync(AUTH_DIR, { recursive: true });
  }

  for (const role of ROLES) {
    await authenticateRole(role, baseURL);
  }
};

export default globalSetup;
