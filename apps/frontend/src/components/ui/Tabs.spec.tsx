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

vi.mock('@radix-ui/react-tabs', () => {
  const Root = ({ children, ...props }: any) => (
    <div
      data-testid="tabs-root"
      {...props}
    >
      {children}
    </div>
  );
  const List = ({ children, className, ...props }: any) => (
    <div
      data-testid="tabs-list"
      className={className}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  );
  List.displayName = 'TabsList';
  const Trigger = ({ children, className, ...props }: any) => (
    <button
      data-testid="tabs-trigger"
      className={className}
      role="tab"
      {...props}
    >
      {children}
    </button>
  );
  Trigger.displayName = 'TabsTrigger';
  const Content = ({ children, className, ...props }: any) => (
    <div
      data-testid="tabs-content"
      className={className}
      role="tabpanel"
      {...props}
    >
      {children}
    </div>
  );
  Content.displayName = 'TabsContent';
  return { Root, List, Trigger, Content };
});

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

describe('Tabs', () => {
  it('renders tabs with list and triggers', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(screen.getByTestId('tabs-root')).toBeInTheDocument();
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
  });

  it('renders TabsContent with children', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsContent value="tab1">Panel 1</TabsContent>
      </Tabs>,
    );
    expect(screen.getByText('Panel 1')).toBeInTheDocument();
  });

  it('applies custom className to TabsList', () => {
    render(
      <Tabs>
        <TabsList className="extra-class">
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(screen.getByTestId('tabs-list').className).toContain('extra-class');
  });

  it('applies custom className to TabsTrigger', () => {
    render(
      <Tabs>
        <TabsList>
          <TabsTrigger
            value="a"
            className="trigger-custom"
          >
            A
          </TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    expect(screen.getByTestId('tabs-trigger').className).toContain('trigger-custom');
  });
});
