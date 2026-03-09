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
  Button: ({ children, onClick, ...props }: any) => (
    <button
      data-testid="edit-icon-btn"
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  ),
}));
vi.mock('@libs/ui/types/NativeAppHeaderProps', () => ({}));
vi.mock('@libs/common/constants/standardActionIcons', () => ({
  EditIcon: { iconName: 'pen', prefix: 'fas' },
}));
vi.mock('@/utils/getAppIconClassName', () => ({
  default: () => 'app-icon-class',
}));

const mockSetIsEditIconDialogOpen = vi.fn();
vi.mock('@/pages/Settings/AppConfig/useAppConfigsStore', () => ({
  default: (selector: any) => selector({ setIsEditIconDialogOpen: mockSetIsEditIconDialogOpen }),
}));
vi.mock('@/components/shared/IconWrapper', () => ({
  default: ({ iconSrc, alt, ...props }: any) => (
    <img
      data-testid="icon-wrapper"
      src={iconSrc}
      alt={alt}
      {...props}
    />
  ),
}));

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NativeAppHeader from './NativeAppHeader';

describe('NativeAppHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders title and description', () => {
    render(
      <NativeAppHeader
        title="My App"
        iconSrc="https://example.com/icon.png"
        description="App description"
      />,
    );
    expect(screen.getByText('My App')).toBeInTheDocument();
    expect(screen.getByText('App description')).toBeInTheDocument();
  });

  it('renders IconWrapper when iconSrc is a string', () => {
    render(
      <NativeAppHeader
        title="My App"
        iconSrc="https://example.com/icon.png"
      />,
    );
    expect(screen.getByTestId('icon-wrapper')).toBeInTheDocument();
  });

  it('renders FontAwesomeIcon when iconSrc is an IconDefinition', () => {
    const iconDef = { iconName: 'home', prefix: 'fas', icon: [512, 512, [], '', ''] } as any;
    render(
      <NativeAppHeader
        title="My App"
        iconSrc={iconDef}
      />,
    );
    expect(screen.getByTestId('fa-icon')).toBeInTheDocument();
  });

  it('renders edit button when isAppIconEditable is true', () => {
    render(
      <NativeAppHeader
        title="My App"
        iconSrc="https://example.com/icon.png"
        isAppIconEditable
      />,
    );
    const editBtn = screen.getByTestId('edit-icon-btn');
    fireEvent.click(editBtn);
    expect(mockSetIsEditIconDialogOpen).toHaveBeenCalledWith(true);
  });

  it('does not render edit button by default', () => {
    render(
      <NativeAppHeader
        title="My App"
        iconSrc="https://example.com/icon.png"
      />,
    );
    expect(screen.queryByTestId('edit-icon-btn')).not.toBeInTheDocument();
  });
});
