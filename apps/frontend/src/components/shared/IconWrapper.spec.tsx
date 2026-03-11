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

vi.mock('@/utils/getAppIconClassName', () => ({
  default: vi.fn(() => 'mock-icon-class'),
}));

vi.mock('@/utils/fontAwesomeIcons', () => ({
  resolveFontAwesomeIconUrl: vi.fn((src: string) => `/resolved/${src}`),
}));

vi.mock('@libs/ui/constants/icon', () => ({
  CUSTOM_UPLOAD_IDENTIFIER: 'custom-upload',
  FONT_AWESOME_IDENTIFIER: 'fontawsome-',
  DEFAULT_ICON_MASK_SIZE: '75%',
  DEFAULT_ICON_WEBP_SIZE: '80%',
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import IconWrapper from './IconWrapper';

describe('IconWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a standard SVG icon as an img element', () => {
    render(
      <IconWrapper
        iconSrc="/icons/app.svg"
        alt="App Icon"
      />,
    );

    const img = screen.getByAltText('App Icon');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/icons/app.svg');
  });

  it('uses mask technique for FontAwesome icons', () => {
    const { container } = render(
      <IconWrapper
        iconSrc="fontawsome-solid/home.svg"
        alt="Home"
      />,
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    const maskedDiv =
      container.querySelector('[style*="maskImage"]') || container.querySelector('[style*="mask-image"]');
    expect(maskedDiv).toBeInTheDocument();
  });

  it('uses mask technique for custom uploaded SVGs', () => {
    const { container } = render(
      <IconWrapper
        iconSrc="custom-upload/my-icon.svg"
        alt="Custom"
      />,
    );

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    const maskedDiv =
      container.querySelector('[style*="maskImage"]') || container.querySelector('[style*="mask-image"]');
    expect(maskedDiv).toBeInTheDocument();
  });

  it('renders webp images with img tag inside wrapper', () => {
    render(
      <IconWrapper
        iconSrc="/icons/photo.webp"
        alt="Photo"
      />,
    );

    const img = screen.getByAltText('Photo');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/icons/photo.webp');
  });

  it('applies width and height props to standard images', () => {
    render(
      <IconWrapper
        iconSrc="/icons/app.svg"
        alt="Sized"
        width={32}
        height={32}
      />,
    );

    const img = screen.getByAltText('Sized');
    expect(img).toHaveAttribute('width', '32');
    expect(img).toHaveAttribute('height', '32');
  });

  it('applies className to the rendered element', () => {
    render(
      <IconWrapper
        iconSrc="/icons/app.svg"
        alt="Styled"
        className="custom-class"
      />,
    );

    const img = screen.getByAltText('Styled');
    expect(img.className).toContain('custom-class');
  });
});
