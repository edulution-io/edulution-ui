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
  FontAwesomeIcon: ({ icon, className }: any) => (
    <span
      data-testid="fa-icon"
      data-icon-name={icon?.iconName}
      className={className}
    />
  ),
}));

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

vi.mock('./IconWrapper', () => ({
  default: ({ iconSrc, alt, className }: any) => (
    <img
      data-testid="icon-wrapper"
      src={iconSrc}
      alt={alt}
      className={className}
    />
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import MenuBarRenderIcon from './MenuBarRenderIcon';

describe('MenuBarRenderIcon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a React element directly when icon is a valid element', () => {
    const customElement = <div data-testid="custom-element">Custom</div>;

    render(
      <MenuBarRenderIcon
        icon={customElement as any}
        alt="custom"
      />,
    );

    expect(screen.getByTestId('custom-element')).toBeInTheDocument();
  });

  it('renders IconWrapper when icon is a string', () => {
    render(
      <MenuBarRenderIcon
        icon="/icons/app.svg"
        alt="App"
        className="icon-class"
      />,
    );

    const wrapper = screen.getByTestId('icon-wrapper');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveAttribute('src', '/icons/app.svg');
    expect(wrapper).toHaveAttribute('alt', 'App');
  });

  it('renders FontAwesomeIcon when icon is an IconDefinition', () => {
    const faIcon = { iconName: 'home', prefix: 'fas', icon: [512, 512, [], '', ''] } as any;

    render(
      <MenuBarRenderIcon
        icon={faIcon}
        alt="Home"
      />,
    );

    expect(screen.getByTestId('fa-icon')).toBeInTheDocument();
    expect(screen.getByTestId('fa-icon')).toHaveAttribute('data-icon-name', 'home');
  });

  it('applies className to IconWrapper for string icons', () => {
    render(
      <MenuBarRenderIcon
        icon="/icons/test.svg"
        alt="Test"
        className="my-class"
      />,
    );

    const wrapper = screen.getByTestId('icon-wrapper');
    expect(wrapper.className).toContain('my-class');
    expect(wrapper.className).toContain('object-contain');
  });

  it('applies className to FontAwesomeIcon for icon definitions', () => {
    const faIcon = { iconName: 'cog', prefix: 'fas', icon: [512, 512, [], '', ''] } as any;

    render(
      <MenuBarRenderIcon
        icon={faIcon}
        alt="Settings"
        className="fa-class"
      />,
    );

    const icon = screen.getByTestId('fa-icon');
    expect(icon.className).toContain('fa-class');
    expect(icon.className).toContain('scale-75');
  });
});
