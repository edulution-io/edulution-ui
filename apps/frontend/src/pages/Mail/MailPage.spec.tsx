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

vi.mock('sonner', () => ({ toast: { error: vi.fn(), info: vi.fn(), success: vi.fn(), dismiss: vi.fn() } }));
vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  HelmetProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/components/structure/framing/Native/NativeFrame', () => ({
  default: ({ appName }: { appName: string }) => (
    <iframe
      data-testid="native-frame"
      title={appName}
      data-app-name={appName}
    />
  ),
}));

import React from 'react';
import { screen } from '@testing-library/react';
import renderWithProviders from '@libs/test-utils/providers/renderWithProviders';
import APPS from '@libs/appconfig/constants/apps';
import MailPage from './MailPage';

// FECP-08 Scope: MailPage renders NativeFrame (iframe) pointing to an external mail service.
// Mail compose, editor, recipients, attachments, and send behaviors live inside the cross-origin
// iframe and are NOT accessible from component tests (RTL/jsdom cannot access iframe content).
// These behaviors are covered by E2E tests (E2ET-07) via Playwright's frameLocator.
// Component tests verify the iframe wrapper renders correctly with the right appName.
describe('MailPage', () => {
  it('renders NativeFrame component', () => {
    renderWithProviders(<MailPage />);

    expect(screen.getByTestId('native-frame')).toBeInTheDocument();
  });

  it('passes APPS.MAIL as appName to NativeFrame', () => {
    renderWithProviders(<MailPage />);

    const frame = screen.getByTestId('native-frame');
    expect(frame).toHaveAttribute('data-app-name', APPS.MAIL);
  });

  it('renders an iframe element', () => {
    renderWithProviders(<MailPage />);

    const iframe = screen.getByTestId('native-frame');
    expect(iframe.tagName).toBe('IFRAME');
  });

  it('verifies iframe title attribute matches APPS.MAIL for accessibility', () => {
    renderWithProviders(<MailPage />);

    expect(screen.getByTitle(APPS.MAIL)).toBeInTheDocument();
  });
});
