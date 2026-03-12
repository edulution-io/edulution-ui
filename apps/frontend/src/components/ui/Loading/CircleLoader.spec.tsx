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
vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children, className, style, ...props }: any) => (
      <span
        data-testid="motion-span"
        className={className}
        style={style}
      >
        {children}
      </span>
    ),
  },
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import CircleLoader from './CircleLoader';

describe('CircleLoader', () => {
  it('renders the loader container', () => {
    const { container } = render(<CircleLoader />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.className).toContain('relative');
  });

  it('applies default height and width classes', () => {
    const { container } = render(<CircleLoader />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('h-12');
    expect(wrapper.className).toContain('w-12');
  });

  it('applies custom height and width classes', () => {
    const { container } = render(
      <CircleLoader
        height="h-8"
        width="w-8"
      />,
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('h-8');
    expect(wrapper.className).toContain('w-8');
  });

  it('applies custom className', () => {
    const { container } = render(<CircleLoader className="my-loader" />);

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('my-loader');
  });

  it('uses light mode border classes when forceLightMode is true', () => {
    render(<CircleLoader forceLightMode />);

    const spinner = screen.getByTestId('motion-span');
    expect(spinner.className).toContain('border-ciLightGrey');
    expect(spinner.className).toContain('border-t-ciLightBlue');
  });

  it('uses default border classes when forceLightMode is false', () => {
    render(<CircleLoader />);

    const spinner = screen.getByTestId('motion-span');
    expect(spinner.className).toContain('border-accent');
    expect(spinner.className).toContain('border-t-primary');
  });
});
