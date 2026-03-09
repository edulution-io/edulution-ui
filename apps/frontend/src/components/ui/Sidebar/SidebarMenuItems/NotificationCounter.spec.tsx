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

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));
vi.mock('@libs/notification/constants/notificationCounterVariant', () => ({
  default: { APP_NOTIFICATION: 'bg-red-500' },
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import NotificationCounter from './NotificationCounter';

describe('NotificationCounter', () => {
  it('returns null when count is 0', () => {
    const { container } = render(<NotificationCounter count={0} />);

    expect(container.firstChild).toBeNull();
  });

  it('renders the count when count is greater than 0', () => {
    render(<NotificationCounter count={3} />);

    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders maxCount+ when count exceeds maxCount', () => {
    render(
      <NotificationCounter
        count={15}
        maxCount={9}
      />,
    );

    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('uses default maxCount of 9', () => {
    render(<NotificationCounter count={10} />);

    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('renders accessible label with notification count', () => {
    render(<NotificationCounter count={5} />);

    expect(screen.getByLabelText('5 new notifications')).toBeInTheDocument();
  });

  it('renders accessible label with maxCount+ format when exceeded', () => {
    render(
      <NotificationCounter
        count={20}
        maxCount={9}
      />,
    );

    expect(screen.getByLabelText('9+ new notifications')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    render(
      <NotificationCounter
        count={3}
        className="custom-position"
      />,
    );

    const counter = screen.getByText('3');
    expect(counter.className).toContain('custom-position');
  });
});
