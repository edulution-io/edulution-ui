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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@edulution-io/ui-kit', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button
      data-testid="login-button"
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
}));
vi.mock('@libs/auth/constants/loginRoute', () => ({
  default: '/login',
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/surveys/123', search: '?code=abc' }),
  useNavigate: () => mockNavigate,
}));

vi.mock('@/store/UserStore/useUserStore', () => ({
  default: vi.fn(() => ({ user: null })),
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import useUserStore from '@/store/UserStore/useUserStore';
import PublicAccessFormHeader from './PublicAccessFormHeader';

describe('PublicAccessFormHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useUserStore).mockReturnValue({ user: null } as any);
  });

  it('renders login button and divider when user is not logged in', () => {
    render(<PublicAccessFormHeader />);
    expect(screen.getByText('common.toLogin')).toBeInTheDocument();
    expect(screen.getByText('common.orContinueWithoutAccount')).toBeInTheDocument();
  });

  it('returns null when user is logged in', () => {
    vi.mocked(useUserStore).mockReturnValue({ user: { username: 'admin' } } as any);
    const { container } = render(<PublicAccessFormHeader />);
    expect(container.innerHTML).toBe('');
  });

  it('navigates to login with correct state on button click', () => {
    render(<PublicAccessFormHeader />);
    fireEvent.click(screen.getByText('common.toLogin'));
    expect(mockNavigate).toHaveBeenCalledWith('/login', {
      state: { from: '/surveys/123' },
    });
  });
});
