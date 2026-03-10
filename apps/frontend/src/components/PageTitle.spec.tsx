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
vi.mock('react-helmet-async', () => ({
  Helmet: ({ children }: any) => <div data-testid="helmet">{children}</div>,
}));
vi.mock('@libs/common/constants/applicationName', () => ({
  default: 'edulution.io',
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import PageTitle from './PageTitle';

describe('PageTitle', () => {
  it('renders translated title with application name', () => {
    render(<PageTitle translationId="pages.files" />);

    expect(screen.getByText(/pages\.files/)).toBeInTheDocument();
    expect(screen.getByText(/edulution\.io/)).toBeInTheDocument();
  });

  it('includes title prefix when title prop is provided', () => {
    render(
      <PageTitle
        translationId="pages.files"
        title="My Files"
      />,
    );

    expect(screen.getByText(/My Files/)).toBeInTheDocument();
  });

  it('uses raw translationId when disableTranslation is true', () => {
    render(
      <PageTitle
        translationId="Raw Title"
        disableTranslation
      />,
    );

    expect(screen.getByText(/Raw Title/)).toBeInTheDocument();
  });

  it('wraps title in Helmet component', () => {
    render(<PageTitle translationId="pages.home" />);

    expect(screen.getByTestId('helmet')).toBeInTheDocument();
  });

  it('renders without title prefix when title prop is not provided', () => {
    render(<PageTitle translationId="pages.dashboard" />);

    const titleContent = screen.getByTestId('helmet').textContent;
    expect(titleContent).not.toContain(' - pages.dashboard - ');
    expect(titleContent).toContain('pages.dashboard');
  });
});
