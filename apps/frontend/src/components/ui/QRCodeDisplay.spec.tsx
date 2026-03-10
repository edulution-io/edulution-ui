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

vi.mock('qrcode.react', () => ({
  QRCodeSVG: ({ value, size, ...props }: any) => (
    <svg
      data-testid="qr-svg"
      data-value={value}
      data-size={size}
      {...props}
    />
  ),
}));

vi.mock('./Loading/CircleLoader', () => ({
  default: ({ className }: any) => (
    <div
      data-testid="circle-loader"
      className={className}
    />
  ),
}));

vi.mock('@libs/ui/types/sizes', () => ({}));

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
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import QRCodeDisplay from './QRCodeDisplay';

describe('QRCodeDisplay', () => {
  it('renders QRCodeSVG with the given value and default size', () => {
    render(<QRCodeDisplay value="https://example.com" />);
    const svg = screen.getByTestId('qr-svg');
    expect(svg.getAttribute('data-value')).toBe('https://example.com');
    expect(svg.getAttribute('data-size')).toBe('256');
  });

  it('renders with sm size', () => {
    render(
      <QRCodeDisplay
        value="test"
        size="sm"
      />,
    );
    expect(screen.getByTestId('qr-svg').getAttribute('data-size')).toBe('64');
  });

  it('renders with lg size', () => {
    render(
      <QRCodeDisplay
        value="test"
        size="lg"
      />,
    );
    expect(screen.getByTestId('qr-svg').getAttribute('data-size')).toBe('200');
  });

  it('shows CircleLoader when isLoading is true', () => {
    render(
      <QRCodeDisplay
        value="test"
        isLoading
      />,
    );
    expect(screen.getByTestId('circle-loader')).toBeInTheDocument();
    expect(screen.queryByTestId('qr-svg')).not.toBeInTheDocument();
  });
});
