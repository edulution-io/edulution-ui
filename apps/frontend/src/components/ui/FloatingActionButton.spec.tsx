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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
  Button: ({ children, onClick, onMouseEnter, type, ...props }: any) => (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      type={type}
      data-testid="btn"
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon, className }: any) => (
    <span
      data-testid="fa-icon"
      className={className}
    />
  ),
}));

vi.mock('@/hooks/useFontAwesomeHoverAnimation', () => ({
  default: () => ({ animate: false, triggerAnimation: vi.fn() }),
}));

vi.mock('@/components/shared/DropdownMenu', () => ({
  default: ({ trigger, items }: any) => (
    <div data-testid="dropdown-menu">
      {trigger}
      {items.map((item: any, i: number) => (
        <span key={i}>{item.label}</span>
      ))}
    </div>
  ),
}));

vi.mock('@libs/ui/constants/floatingButtonsConfig', () => ({
  FLOATING_BUTTON_CLASS_NAME: 'floating-btn',
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import FloatingActionButton from './FloatingActionButton';

describe('FloatingActionButton', () => {
  it('renders a button with text', () => {
    render(
      <FloatingActionButton
        icon={faPlus}
        text="Add Item"
        onClick={vi.fn()}
      />,
    );
    const texts = screen.getAllByText('Add Item');
    expect(texts.length).toBeGreaterThanOrEqual(1);
  });

  it('renders the icon', () => {
    render(
      <FloatingActionButton
        icon={faPlus}
        text="Add"
        onClick={vi.fn()}
      />,
    );
    expect(screen.getByTestId('fa-icon')).toBeInTheDocument();
  });

  it('calls onClick when button is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <FloatingActionButton
        icon={faPlus}
        text="Add"
        onClick={handleClick}
      />,
    );

    await user.click(screen.getByTestId('btn'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('renders dropdown variant when dropdown items provided', () => {
    render(
      <FloatingActionButton
        icon={faPlus}
        text="Options"
        variant="dropdown"
        dropdownItems={[{ label: 'Item 1', onClick: vi.fn() }]}
      />,
    );
    expect(screen.getByTestId('dropdown-menu')).toBeInTheDocument();
  });

  it('shows tooltip text on hover area', () => {
    render(
      <FloatingActionButton
        icon={faPlus}
        text="Tooltip Text"
        onClick={vi.fn()}
      />,
    );
    const tooltipSpans = screen.getAllByText('Tooltip Text');
    expect(tooltipSpans.length).toBeGreaterThanOrEqual(1);
  });
});
