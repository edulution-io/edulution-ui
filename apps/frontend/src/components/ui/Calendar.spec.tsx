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

vi.mock('react-day-picker', () => ({
  DayPicker: ({ className, classNames, showOutsideDays, components, ...props }: any) => (
    <div
      data-testid="day-picker"
      data-show-outside={showOutsideDays}
      className={className}
      {...props}
    >
      {components?.IconLeft && <components.IconLeft />}
      {components?.IconRight && <components.IconRight />}
    </div>
  ),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: (props: any) => <span data-testid="fa-icon" />,
}));

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) =>
    args
      .flatMap((a: any) => {
        if (typeof a === 'string') return a;
        if (a && typeof a === 'object')
          return Object.entries(a)
            .filter(([, v]) => v)
            .map(([k]) => k);
        return [];
      })
      .filter(Boolean)
      .join(' '),
  buttonVariants: () => 'btn-variant',
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Calendar } from './Calendar';

describe('Calendar', () => {
  it('renders the DayPicker with showOutsideDays defaulting to true', () => {
    render(<Calendar />);
    const picker = screen.getByTestId('day-picker');
    expect(picker).toBeInTheDocument();
    expect(picker.getAttribute('data-show-outside')).toBe('true');
  });

  it('applies custom className', () => {
    render(<Calendar className="custom-cal" />);
    expect(screen.getByTestId('day-picker').className).toContain('custom-cal');
  });

  it('renders left and right navigation icons', () => {
    render(<Calendar />);
    const icons = screen.getAllByTestId('fa-icon');
    expect(icons).toHaveLength(2);
  });

  it('allows overriding showOutsideDays', () => {
    render(<Calendar showOutsideDays={false} />);
    expect(screen.getByTestId('day-picker').getAttribute('data-show-outside')).toBe('false');
  });
});
