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

vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }: any) => (
    <a
      href={to}
      {...props}
    >
      {children}
    </a>
  ),
}));

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

vi.mock('@libs/common/constants/applicationName', () => ({
  default: 'edulution.io',
}));

vi.mock('@libs/ui/constants/textColorVariant', () => ({
  default: { LIGHT: 'light', DARK: 'dark' },
}));

vi.mock('@/hooks/useLanguage', () => ({
  default: () => ({ language: 'en' }),
}));

vi.mock('@/store/UserStore/useUserStore', () => ({
  default: (selector: any) => selector({ isAuthenticated: true }),
}));

vi.mock('@/hooks/useMedia', () => ({
  default: () => ({ isMobileView: false, isTabletView: false }),
}));

vi.mock('@/hooks/useFooterColors', () => ({
  default: () => null,
}));

vi.mock('@/pages/Settings/AppConfig/useAppConfigsStore', () => ({
  default: (selector: any) =>
    selector({
      publicAppConfigs: [
        { name: 'privacy', displayName: 'Privacy Policy' },
        { name: 'imprint', displayName: 'Imprint' },
      ],
    }),
}));

vi.mock('@/utils/getDisplayName', () => ({
  default: (config: any) => config.displayName,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  it('renders the footer element', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('displays the application name', () => {
    render(<Footer />);
    expect(screen.getByText(/edulution\.io/)).toBeInTheDocument();
  });

  it('renders links for public app configs', () => {
    render(<Footer />);
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Imprint')).toBeInTheDocument();
  });

  it('renders version info when authenticated on desktop', () => {
    render(<Footer />);
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
  });
});
