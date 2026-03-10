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

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-use-before-define, jsx-a11y/label-has-associated-control, jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus, jsx-a11y/role-has-required-aria-props, react/button-has-type, react/display-name, react/no-array-index-key, no-underscore-dangle, no-plusplus */

const { mockToastError, mockWindowOpen } = vi.hoisted(() => ({
  mockToastError: vi.fn(),
  mockWindowOpen: vi.fn(),
}));
const mockAppConfigs: any[] = [];

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/test-app/some-path' }),
  Navigate: ({ to, replace }: any) => (
    <div
      data-testid="navigate"
      data-to={to}
      data-replace={String(replace)}
    />
  ),
}));

vi.mock('@/pages/Settings/AppConfig/useAppConfigsStore', () => ({
  default: () => ({ appConfigs: mockAppConfigs }),
}));

vi.mock('@/hooks/useLanguage', () => ({
  default: () => ({ language: 'en' }),
}));

vi.mock('@/hooks/useUserAccounts', () => ({
  default: vi.fn(),
}));

vi.mock('@libs/common/utils', () => ({
  getFromPathName: (pathname: string, index: number) => pathname.split('/')[index] || '',
}));

vi.mock('@libs/common/utils/findAppConfigByName', () => ({
  default: (configs: any[], name: string) => configs.find((c: any) => c.name === name) || null,
}));

vi.mock('@/utils/getDisplayName', () => ({
  default: (config: any, lang: string) => config?.displayName || config?.name || '',
}));

vi.mock('@/components/PageTitle', () => ({
  default: ({ translationId }: any) => <div data-testid="page-title">{translationId}</div>,
}));

vi.mock('@/components/shared/IconWrapper', () => ({
  default: ({ iconSrc, alt, ...props }: any) => (
    <div
      data-testid="icon-wrapper"
      data-icon-src={iconSrc}
      data-alt={alt}
    />
  ),
}));

vi.mock('@/assets/layout/Pfeil.svg?react', () => ({
  default: (props: any) => <svg data-testid="arrow-icon" />,
}));

vi.mock('@edulution-io/ui-kit', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button
      onClick={onClick}
      data-testid="forwarding-button"
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('sonner', () => ({
  toast: { error: mockToastError },
}));

vi.mock('@libs/appconfig/constants/extendedOptionKeys', () => ({
  default: { FORWARDING_FORWARD_DIRECTLY: 'FORWARDING_FORWARD_DIRECTLY' },
}));

vi.mock('@libs/dashboard/constants/landingPageRoute', () => ({
  default: '/landing-page',
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForwardingPage from './ForwardingPage';

describe('ForwardingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAppConfigs.length = 0;
    mockWindowOpen.mockReset();
    Object.defineProperty(window, 'open', { value: mockWindowOpen, writable: true });
  });

  it('redirects to landing page when no config found', () => {
    render(<ForwardingPage />);

    const navigate = screen.getByTestId('navigate');
    expect(navigate).toBeInTheDocument();
    expect(navigate).toHaveAttribute('data-to', '/landing-page');
    expect(navigate).toHaveAttribute('data-replace', 'true');
  });

  it('renders forwarding page when config exists', () => {
    mockAppConfigs.push({
      name: 'test-app',
      displayName: 'Test App',
      icon: '/icon.png',
      options: { url: 'https://example.com' },
    });

    render(<ForwardingPage />);

    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    expect(screen.getByTestId('page-title')).toBeInTheDocument();
    expect(screen.getAllByText('Test App').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByTestId('forwarding-button')).toBeInTheDocument();
    const container = screen.getByTestId('forwarding-button').closest('[data-forwarding-page]');
    expect(container).toBeInTheDocument();
  });

  it('opens external link when button is clicked', async () => {
    const user = userEvent.setup();
    mockAppConfigs.push({
      name: 'test-app',
      displayName: 'Test App',
      icon: '/icon.png',
      options: { url: 'https://example.com' },
    });

    render(<ForwardingPage />);

    await user.click(screen.getByTestId('forwarding-button'));

    expect(mockWindowOpen).toHaveBeenCalledWith('https://example.com', '_blank');
  });

  it('shows error toast when URL is missing', async () => {
    const user = userEvent.setup();
    mockAppConfigs.push({
      name: 'test-app',
      displayName: 'Test App',
      icon: '/icon.png',
      options: {},
    });

    render(<ForwardingPage />);

    await user.click(screen.getByTestId('forwarding-button'));

    expect(mockToastError).toHaveBeenCalledWith('forwardingpage.missing_link');
    expect(mockWindowOpen).not.toHaveBeenCalled();
  });

  it('auto-forwards when FORWARDING_FORWARD_DIRECTLY is set', () => {
    mockAppConfigs.push({
      name: 'test-app',
      displayName: 'Test App',
      icon: '/icon.png',
      options: { url: 'https://auto-forward.com' },
      extendedOptions: { FORWARDING_FORWARD_DIRECTLY: true },
    });

    render(<ForwardingPage />);

    expect(mockWindowOpen).toHaveBeenCalledWith('https://auto-forward.com', '_blank');
  });
});
