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

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

class MockEventSource {
  onmessage: ((event: MessageEvent) => void) | null = null;

  onerror: ((event: Event) => void) | null = null;

  addEventListener = vi.fn();

  removeEventListener = vi.fn();

  close = vi.fn();
}
Object.defineProperty(window, 'EventSource', { value: MockEventSource, writable: true });

vi.mock('sonner', () => ({ toast: { error: vi.fn(), info: vi.fn(), success: vi.fn(), dismiss: vi.fn() } }));
vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  HelmetProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/assets/icons', () => ({
  QrCodeIcon: (props: Record<string, unknown>) => (
    <span
      data-testid="qr-icon"
      {...props}
    />
  ),
}));
vi.mock('react-oidc-context', () => ({
  useAuth: vi.fn(),
}));
vi.mock('@/hooks/useDeploymentTarget', () => ({
  default: () => ({ isLmn: false, isGeneric: true }),
}));
vi.mock('./useSilentLoginWithPassword', () => ({
  default: () => ({ silentLogin: vi.fn() }),
}));
vi.mock('./useAuthErrorHandler', () => ({
  default: vi.fn(),
}));
vi.mock('@/components/ui/QRCodeDisplay', () => ({
  default: ({ value }: { value: string }) => <div data-testid="qr-code-display">{value}</div>,
}));
vi.mock('@/utils/getRandomUUID', () => ({
  default: () => 'test-uuid-123',
}));
vi.mock('./components/TotpInput', () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="totp-input">{title}</div>
  ),
}));

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuth } from 'react-oidc-context';
import renderWithProviders from '@libs/test-utils/providers/renderWithProviders';
import useUserStore from '@/store/UserStore/useUserStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import useGlobalSettingsApiStore from '../Settings/GlobalSettings/useGlobalSettingsApiStore';
import LoginPage from './LoginPage';

const mockSigninResourceOwnerCredentials = vi.fn();
const mockGetTotpStatus = vi.fn().mockResolvedValue(false);

const defaultAuthMock = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  error: null,
  signinResourceOwnerCredentials: mockSigninResourceOwnerCredentials,
  signinRedirect: vi.fn(),
  signoutRedirect: vi.fn(),
  removeUser: vi.fn(),
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue(defaultAuthMock as never);
    useUserStore.setState({
      eduApiToken: '',
      isAuthenticated: false,
      createOrUpdateUser: vi.fn(),
      setEduApiToken: vi.fn(),
      getTotpStatus: mockGetTotpStatus,
      totpIsLoading: false,
    } as never);
    useAppConfigsStore.setState({
      appConfigs: [{ name: 'none' }] as never,
    });
    useGlobalSettingsApiStore.setState({
      globalSettings: null,
    });
  });

  it('renders login form with username and password fields', () => {
    renderWithProviders(<LoginPage />, { route: '/login' });

    expect(screen.getByTestId('test-id-login-page-username-input')).toBeInTheDocument();
    expect(screen.getByTestId('test-id-login-page-password-input')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    renderWithProviders(<LoginPage />, { route: '/login' });

    expect(screen.getByTestId('test-id-login-page-submit-button')).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    const user = userEvent.setup();

    renderWithProviders(<LoginPage />, { route: '/login' });

    await user.click(screen.getByTestId('test-id-login-page-submit-button'));

    await waitFor(() => {
      const form = screen.getByTestId('test-id-login-page-form');
      expect(form).toBeInTheDocument();
    });
  });

  it('calls signinResourceOwnerCredentials with credentials on submit', async () => {
    const user = userEvent.setup();
    mockGetTotpStatus.mockResolvedValue(false);
    mockSigninResourceOwnerCredentials.mockResolvedValue({
      access_token: 'test-token',
      profile: { preferred_username: 'testuser' },
    });

    renderWithProviders(<LoginPage />, { route: '/login' });

    await user.type(screen.getByTestId('test-id-login-page-username-input'), 'testuser');
    await user.type(screen.getByTestId('test-id-login-page-password-input'), 'testpass');
    await user.click(screen.getByTestId('test-id-login-page-submit-button'));

    await waitFor(() => {
      expect(mockGetTotpStatus).toHaveBeenCalledWith('testuser');
    });
  });

  it('shows loading text on submit button when isLoading is true', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...defaultAuthMock,
      isLoading: true,
    } as never);

    renderWithProviders(<LoginPage />, { route: '/login' });

    const submitButton = screen.getByTestId('test-id-login-page-submit-button');
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('common.loading');
  });

  it('shows QR code display when app login button is clicked', async () => {
    const user = userEvent.setup();

    renderWithProviders(<LoginPage />, { route: '/login' });

    const qrButton = screen.getByText('login.loginWithApp');
    await user.click(qrButton);

    await waitFor(() => {
      expect(screen.getByTestId('qr-code-display')).toBeInTheDocument();
    });
  });

  it('hides form fields when QR code is shown', async () => {
    const user = userEvent.setup();

    renderWithProviders(<LoginPage />, { route: '/login' });

    const qrButton = screen.getByText('login.loginWithApp');
    await user.click(qrButton);

    await waitFor(() => {
      expect(screen.queryByTestId('test-id-login-page-submit-button')).not.toBeInTheDocument();
    });
  });

  it('shows CircleLoader when waiting for redirect after auth', () => {
    vi.mocked(useAuth).mockReturnValue({
      ...defaultAuthMock,
      isAuthenticated: true,
    } as never);

    renderWithProviders(<LoginPage />, { route: '/login' });

    expect(screen.queryByTestId('test-id-login-page-submit-button')).not.toBeInTheDocument();
  });

  it('shows TOTP input when getTotpStatus returns true after form submit', async () => {
    const user = userEvent.setup();
    mockGetTotpStatus.mockResolvedValue(true);

    renderWithProviders(<LoginPage />, { route: '/login' });

    await user.type(screen.getByTestId('test-id-login-page-username-input'), 'mfauser');
    await user.type(screen.getByTestId('test-id-login-page-password-input'), 'testpass');
    await user.click(screen.getByTestId('test-id-login-page-submit-button'));

    await waitFor(() => {
      expect(mockGetTotpStatus).toHaveBeenCalledWith('mfauser');
    });

    await waitFor(() => {
      expect(screen.getByTestId('totp-input')).toBeInTheDocument();
      expect(screen.getByTestId('totp-input')).toHaveTextContent('login.enterMultiFactorCode');
    });

    expect(screen.queryByTestId('test-id-login-page-username-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('test-id-login-page-password-input')).not.toBeInTheDocument();
  });
});
