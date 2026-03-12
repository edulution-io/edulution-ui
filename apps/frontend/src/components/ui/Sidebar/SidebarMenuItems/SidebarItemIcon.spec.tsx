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
vi.mock('@libs/ui/constants/sidebar', () => ({
  SIDEBAR_ICON_HEIGHT: 32,
  SIDEBAR_ICON_WIDTH: 32,
}));
vi.mock('@/components/shared/IconWrapper', () => ({
  default: ({ iconSrc, alt, className, applyLegacyFilter, width, height }: any) => (
    <img
      data-testid="icon-wrapper"
      src={iconSrc}
      alt={alt}
      className={className}
      data-legacy-filter={String(applyLegacyFilter)}
      width={width}
      height={height}
    />
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import SidebarItemIcon from './SidebarItemIcon';

describe('SidebarItemIcon', () => {
  it('renders the icon with correct alt text', () => {
    render(
      <SidebarItemIcon
        isHovered={false}
        isSelected={false}
        iconSrc="/icons/files.svg"
        title="Files"
      />,
    );

    const icon = screen.getByTestId('icon-wrapper');
    expect(icon).toHaveAttribute('alt', 'Files-icon');
  });

  it('applies scale-100 class when not hovered', () => {
    render(
      <SidebarItemIcon
        isHovered={false}
        isSelected={false}
        iconSrc="/icons/files.svg"
        title="Files"
      />,
    );

    const icon = screen.getByTestId('icon-wrapper');
    expect(icon.className).toContain('scale-100');
    expect(icon.className).not.toContain('scale-[1.17]');
  });

  it('applies scale-[1.17] and brightness-125 classes when hovered', () => {
    render(
      <SidebarItemIcon
        isHovered
        isSelected={false}
        iconSrc="/icons/files.svg"
        title="Files"
      />,
    );

    const icon = screen.getByTestId('icon-wrapper');
    expect(icon.className).toContain('scale-[1.17]');
    expect(icon.className).toContain('brightness-125');
  });

  it('applies legacy filter when not selected', () => {
    render(
      <SidebarItemIcon
        isHovered={false}
        isSelected={false}
        iconSrc="/icons/files.svg"
        title="Files"
      />,
    );

    const icon = screen.getByTestId('icon-wrapper');
    expect(icon).toHaveAttribute('data-legacy-filter', 'true');
  });

  it('disables legacy filter when selected', () => {
    render(
      <SidebarItemIcon
        isHovered={false}
        isSelected
        iconSrc="/icons/files.svg"
        title="Files"
      />,
    );

    const icon = screen.getByTestId('icon-wrapper');
    expect(icon).toHaveAttribute('data-legacy-filter', 'false');
  });
});
