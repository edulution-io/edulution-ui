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

vi.mock('@/components/ui/AvatarSH', () => ({
  AvatarSH: ({ children, className, ...props }: any) => (
    <div
      data-testid="avatar-root"
      className={className}
      {...props}
    >
      {children}
    </div>
  ),
  AvatarImage: ({ src, alt, ...props }: any) =>
    src ? (
      <img
        data-testid="avatar-image"
        src={src}
        alt={alt}
        {...props}
      />
    ) : null,
  AvatarFallback: ({ children, ...props }: any) => (
    <span
      data-testid="avatar-fallback"
      {...props}
    >
      {children}
    </span>
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import Avatar from './Avatar';

describe('Avatar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initials from first and last name', () => {
    render(<Avatar user={{ username: 'jdoe', firstName: 'John', lastName: 'Doe' }} />);

    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toHaveTextContent('JD');
  });

  it('shows username fallback when no first/last name', () => {
    render(<Avatar user={{ username: 'admin' }} />);

    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toHaveTextContent('AD');
  });

  it('shows dash when no user provided', () => {
    render(<Avatar />);

    const fallback = screen.getByTestId('avatar-fallback');
    expect(fallback).toHaveTextContent('-');
  });

  it('renders image when imageSrc provided', () => {
    render(
      <Avatar
        user={{ username: 'jdoe', firstName: 'John', lastName: 'Doe' }}
        imageSrc="https://example.com/photo.jpg"
      />,
    );

    const image = screen.getByTestId('avatar-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/photo.jpg');
  });
});
