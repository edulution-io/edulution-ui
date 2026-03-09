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

vi.mock('@radix-ui/react-radio-group', () => {
  const Root = ({ children, className, ...props }: any) => (
    <div
      data-testid="radiogroup-root"
      className={className}
      role="radiogroup"
      {...props}
    >
      {children}
    </div>
  );
  Root.displayName = 'RadioGroup';
  const Item = ({ children, className, value, ...props }: any) => (
    <button
      data-testid={`radiogroup-item-${value}`}
      className={className}
      role="radio"
      {...props}
    >
      {children}
    </button>
  );
  Item.displayName = 'RadioGroupItem';
  const Indicator = ({ children }: any) => <span data-testid="radiogroup-indicator">{children}</span>;
  return { Root, Item, Indicator };
});

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: (props: any) => <span data-testid="fa-icon" />,
}));

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { RadioGroupSH, RadioGroupItemSH } from './RadioGroupSH';

describe('RadioGroupSH', () => {
  it('renders the radio group root', () => {
    render(
      <RadioGroupSH>
        <RadioGroupItemSH value="a" />
      </RadioGroupSH>,
    );
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
  });

  it('renders radio items with check icon indicator', () => {
    render(
      <RadioGroupSH>
        <RadioGroupItemSH value="opt1" />
        <RadioGroupItemSH value="opt2" />
      </RadioGroupSH>,
    );
    expect(screen.getByTestId('radiogroup-item-opt1')).toBeInTheDocument();
    expect(screen.getByTestId('radiogroup-item-opt2')).toBeInTheDocument();
  });

  it('applies custom className to RadioGroupSH', () => {
    render(
      <RadioGroupSH className="gap-4">
        <RadioGroupItemSH value="a" />
      </RadioGroupSH>,
    );
    expect(screen.getByTestId('radiogroup-root').className).toContain('gap-4');
  });

  it('applies custom className to RadioGroupItemSH', () => {
    render(
      <RadioGroupSH>
        <RadioGroupItemSH
          value="a"
          className="item-custom"
        />
      </RadioGroupSH>,
    );
    expect(screen.getByTestId('radiogroup-item-a').className).toContain('item-custom');
  });
});
