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

vi.mock('@radix-ui/react-accordion', () => {
  const Root = ({ children, ...props }: any) => (
    <div
      data-testid="accordion-root"
      {...props}
    >
      {children}
    </div>
  );
  const Item = ({ children, className, ...props }: any) => (
    <div
      data-testid="accordion-item"
      className={className}
      {...props}
    >
      {children}
    </div>
  );
  const Header = ({ children, className }: any) => (
    <div
      data-testid="accordion-header"
      className={className}
    >
      {children}
    </div>
  );
  const Trigger = ({ children, className, ...props }: any) => (
    <button
      data-testid="accordion-trigger"
      className={className}
      {...props}
    >
      {children}
    </button>
  );
  Trigger.displayName = 'AccordionTrigger';
  const Content = ({ children, className, ...props }: any) => (
    <div
      data-testid="accordion-content"
      className={className}
      {...props}
    >
      {children}
    </div>
  );
  Content.displayName = 'AccordionContent';
  return { Root, Item, Header, Trigger, Content };
});

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: (props: any) => <span data-testid="fa-icon" />,
}));

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { AccordionSH, AccordionItem, AccordionTrigger, AccordionContent } from './AccordionSH';

describe('AccordionSH', () => {
  it('renders AccordionSH root with children', () => {
    render(
      <AccordionSH>
        <div>child</div>
      </AccordionSH>,
    );
    expect(screen.getByTestId('accordion-root')).toBeInTheDocument();
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('renders AccordionItem with custom className', () => {
    render(
      <AccordionSH>
        <AccordionItem
          value="item-1"
          className="custom-item"
        >
          Item content
        </AccordionItem>
      </AccordionSH>,
    );
    expect(screen.getByTestId('accordion-item').className).toContain('custom-item');
  });

  it('renders AccordionTrigger with children and chevron icon', () => {
    render(
      <AccordionSH>
        <AccordionItem value="item-1">
          <AccordionTrigger>Toggle</AccordionTrigger>
        </AccordionItem>
      </AccordionSH>,
    );
    expect(screen.getByText('Toggle')).toBeInTheDocument();
    expect(screen.getByTestId('fa-icon')).toBeInTheDocument();
  });

  it('renders AccordionContent with children', () => {
    render(
      <AccordionSH>
        <AccordionItem value="item-1">
          <AccordionContent className="extra">Panel body</AccordionContent>
        </AccordionItem>
      </AccordionSH>,
    );
    expect(screen.getByText('Panel body')).toBeInTheDocument();
  });
});
