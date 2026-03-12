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

import React from 'react';
import { render, screen } from '@testing-library/react';
import DynamicEllipsis from './DynamicEllipsis';

describe('DynamicEllipsis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders text content', () => {
    render(<DynamicEllipsis text="Hello World" />);

    const elements = screen.getAllByText('Hello World');
    const visibleElement = elements.find((el) => !el.classList.contains('invisible'));
    expect(visibleElement).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <DynamicEllipsis
        text="Styled text"
        className="custom-class"
      />,
    );

    const visibleDiv = container.querySelector('div.custom-class');
    expect(visibleDiv).toBeInTheDocument();
    expect(visibleDiv).toHaveTextContent('Styled text');
  });
});
