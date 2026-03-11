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
  const Root = ({ children, className, value, onValueChange, ...props }: any) => (
    <div
      data-testid="accordion-root"
      className={className}
      {...props}
    >
      {children}
    </div>
  );
  const Item = ({ children, className, value }: any) => (
    <div
      data-testid={`accordion-item-${value}`}
      className={className}
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
  const Trigger = ({ children, className }: any) => (
    <button
      data-testid="accordion-trigger"
      className={className}
    >
      {children}
    </button>
  );
  const Content = ({ children, className }: any) => (
    <div
      data-testid="accordion-content"
      className={className}
    >
      {children}
    </div>
  );
  return { Root, Item, Header, Trigger, Content };
});

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) =>
    args
      .flatMap((arg: any) => {
        if (typeof arg === 'string') return arg;
        if (typeof arg === 'object' && arg !== null) {
          return Object.entries(arg)
            .filter(([, v]) => v)
            .map(([k]) => k);
        }
        return [];
      })
      .filter(Boolean)
      .join(' '),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: (props: any) => <span data-testid="fa-icon" />,
}));

vi.mock('@/components/shared/AnchorSection', () => ({
  default: ({ children, id }: any) => (
    <div
      data-testid={`anchor-${id}`}
      id={id}
    >
      {children}
    </div>
  ),
}));

vi.mock('@/store/useSubMenuStore', () => ({
  default: Object.assign(
    (selector?: any) => {
      const state = {
        sectionToOpen: null,
        clearOpenRequest: vi.fn(),
        setSections: vi.fn(),
        activeSection: null,
      };
      return selector ? selector(state) : state;
    },
    { getState: () => ({ sectionToOpen: null, clearOpenRequest: vi.fn(), setSections: vi.fn(), activeSection: null }) },
  ),
}));

vi.mock('@libs/ui/constants/animationTiming', () => ({
  HASH_SCROLL_DELAY_MS: 0,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SectionAccordion, SectionAccordionItem } from './SectionAccordion';

describe('SectionAccordion', () => {
  it('renders accordion root with children', () => {
    render(
      <SectionAccordion>
        <SectionAccordionItem
          id="sec-1"
          label="Section 1"
        >
          Content 1
        </SectionAccordionItem>
      </SectionAccordion>,
    );
    expect(screen.getByTestId('accordion-root')).toBeInTheDocument();
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Content 1')).toBeInTheDocument();
  });

  it('renders multiple accordion items', () => {
    render(
      <SectionAccordion>
        <SectionAccordionItem
          id="a"
          label="Alpha"
        >
          Alpha body
        </SectionAccordionItem>
        <SectionAccordionItem
          id="b"
          label="Beta"
        >
          Beta body
        </SectionAccordionItem>
      </SectionAccordion>,
    );
    expect(screen.getByTestId('accordion-item-a')).toBeInTheDocument();
    expect(screen.getByTestId('accordion-item-b')).toBeInTheDocument();
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('applies custom className to SectionAccordion', () => {
    render(
      <SectionAccordion className="extra">
        <SectionAccordionItem
          id="x"
          label="X"
        >
          X body
        </SectionAccordionItem>
      </SectionAccordion>,
    );
    expect(screen.getByTestId('accordion-root').className).toContain('extra');
  });

  it('renders anchor section with correct id', () => {
    render(
      <SectionAccordion>
        <SectionAccordionItem
          id="settings"
          label="Settings"
        >
          Content
        </SectionAccordionItem>
      </SectionAccordion>,
    );
    expect(screen.getByTestId('anchor-settings')).toBeInTheDocument();
  });
});
