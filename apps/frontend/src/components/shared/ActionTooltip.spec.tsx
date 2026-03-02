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

vi.mock('@radix-ui/react-tooltip', () => ({
  TooltipContent: ({ children, ...props }: any) => (
    <div
      data-testid="tooltip-content"
      {...props}
    >
      {children}
    </div>
  ),
  TooltipTrigger: ({ children, asChild, ...props }: any) => (
    <div
      data-testid="tooltip-trigger"
      {...props}
    >
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/Tooltip', () => ({
  Tooltip: ({ children, ...props }: any) => (
    <div
      data-testid="tooltip-root"
      {...props}
    >
      {children}
    </div>
  ),
}));

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActionTooltip from './ActionTooltip';

describe('ActionTooltip', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders trigger element', () => {
    render(
      <ActionTooltip
        trigger={<span>Click me</span>}
        tooltipText="Tooltip text"
      />,
    );

    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onAction on click', async () => {
    const user = userEvent.setup();
    const handleAction = vi.fn();

    render(
      <ActionTooltip
        trigger={<span>Click me</span>}
        onAction={handleAction}
        tooltipText="Tooltip text"
      />,
    );

    await user.click(screen.getByRole('button'));

    expect(handleAction).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard events (Enter, Space)', () => {
    const handleAction = vi.fn();

    render(
      <ActionTooltip
        trigger={<span>Press me</span>}
        onAction={handleAction}
        tooltipText="Tooltip text"
      />,
    );

    const button = screen.getByRole('button');

    fireEvent.keyDown(button, { key: 'Enter' });
    expect(handleAction).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(button, { key: ' ' });
    expect(handleAction).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(button, { key: 'Tab' });
    expect(handleAction).toHaveBeenCalledTimes(2);
  });
});
