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

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ 'data-testid': testId, ...props }: any) => (
    <span
      data-testid={testId || 'fa-icon'}
      {...props}
    />
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import IconWithCount from './IconWithCount';

const fakeIcon = { prefix: 'fas', iconName: 'bell', icon: [448, 512, [], 'f0f3', ''] } as any;

describe('IconWithCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders icon', () => {
    render(<IconWithCount icon={fakeIcon} />);

    expect(screen.getByTestId('fa-icon')).toBeInTheDocument();
  });

  it('shows count badge when count > 0', () => {
    render(
      <IconWithCount
        icon={fakeIcon}
        count={5}
      />,
    );

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('hides badge when count is 0', () => {
    render(
      <IconWithCount
        icon={fakeIcon}
        count={0}
      />,
    );

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('shows "99+" when count > 99', () => {
    render(
      <IconWithCount
        icon={fakeIcon}
        count={150}
      />,
    );

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('applies cursor pointer when onClick provided', () => {
    const handleClick = vi.fn();

    render(
      <IconWithCount
        icon={fakeIcon}
        onClick={handleClick}
      />,
    );

    const wrapper = screen.getByTestId('fa-icon').parentElement;
    expect(wrapper).toHaveStyle({ cursor: 'pointer' });
  });
});
