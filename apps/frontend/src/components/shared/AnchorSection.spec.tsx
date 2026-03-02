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

import React from 'react';
import { render, screen } from '@testing-library/react';
import AnchorSection from './AnchorSection';

describe('AnchorSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children', () => {
    render(
      <AnchorSection id="test-section">
        <p>Section content</p>
      </AnchorSection>,
    );

    expect(screen.getByText('Section content')).toBeInTheDocument();
  });

  it('sets the id attribute on the section element', () => {
    const { container } = render(<AnchorSection id="my-anchor">Content</AnchorSection>);

    const section = container.querySelector('section');
    expect(section).toHaveAttribute('id', 'my-anchor');
  });

  it('applies scroll-mt-20 class by default', () => {
    const { container } = render(<AnchorSection id="section-1">Content</AnchorSection>);

    const section = container.querySelector('section');
    expect(section?.className).toContain('scroll-mt-20');
  });

  it('applies additional className when provided', () => {
    const { container } = render(
      <AnchorSection
        id="section-2"
        className="extra-class"
      >
        Content
      </AnchorSection>,
    );

    const section = container.querySelector('section');
    expect(section?.className).toContain('extra-class');
  });
});
