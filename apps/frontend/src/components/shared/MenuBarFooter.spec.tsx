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

vi.mock('@libs/appconfig/constants/apps', () => ({
  default: {
    FILE_SHARING: 'filesharing',
    DASHBOARD: 'dashboard',
  },
}));

vi.mock('@/pages/FileSharing/FileSharingMenuBarFooter', () => ({
  default: () => <div data-testid="file-sharing-footer">FileSharingFooter</div>,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import MenuBarFooter from './MenuBarFooter';

describe('MenuBarFooter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the footer component for a registered app', () => {
    render(<MenuBarFooter appName="filesharing" />);

    expect(screen.getByTestId('file-sharing-footer')).toBeInTheDocument();
    expect(screen.getByText('FileSharingFooter')).toBeInTheDocument();
  });

  it('returns null for an unregistered app', () => {
    const { container } = render(<MenuBarFooter appName="dashboard" />);

    expect(container.innerHTML).toBe('');
  });
});
