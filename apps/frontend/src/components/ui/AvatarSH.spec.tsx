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

vi.mock('@radix-ui/react-avatar', () => {
  const Root = ({ children, className, ...props }: any) => (
    <div
      data-testid="avatar-root"
      className={className}
      {...props}
    >
      {children}
    </div>
  );
  Root.displayName = 'Avatar';
  const Image = ({ className, src, alt, ...props }: any) => (
    <img
      data-testid="avatar-image"
      className={className}
      src={src}
      alt={alt}
      {...props}
    />
  );
  Image.displayName = 'AvatarImage';
  const Fallback = ({ children, className, ...props }: any) => (
    <span
      data-testid="avatar-fallback"
      className={className}
      {...props}
    >
      {children}
    </span>
  );
  Fallback.displayName = 'AvatarFallback';
  return { Root, Image, Fallback };
});

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import { AvatarSH, AvatarImage, AvatarFallback } from './AvatarSH';

describe('AvatarSH', () => {
  it('renders the avatar root with custom className', () => {
    render(
      <AvatarSH className="size-12">
        <AvatarFallback>AB</AvatarFallback>
      </AvatarSH>,
    );
    expect(screen.getByTestId('avatar-root').className).toContain('size-12');
  });

  it('renders AvatarImage with src and alt', () => {
    render(
      <AvatarSH>
        <AvatarImage
          src="/photo.jpg"
          alt="User"
        />
      </AvatarSH>,
    );
    const img = screen.getByTestId('avatar-image');
    expect(img).toHaveAttribute('src', '/photo.jpg');
    expect(img).toHaveAttribute('alt', 'User');
  });

  it('renders AvatarFallback with initials', () => {
    render(
      <AvatarSH>
        <AvatarFallback>JD</AvatarFallback>
      </AvatarSH>,
    );
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('applies custom className to AvatarFallback', () => {
    render(
      <AvatarSH>
        <AvatarFallback className="bg-red-500">X</AvatarFallback>
      </AvatarSH>,
    );
    expect(screen.getByTestId('avatar-fallback').className).toContain('bg-red-500');
  });
});
