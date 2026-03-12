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

import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';
import type { ButtonVariant } from './Button';

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('forwards ref to the button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref test</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('spreads additional HTML attributes', () => {
    render(
      <Button
        data-testid="custom-btn"
        aria-label="custom"
      >
        Test
      </Button>,
    );
    expect(screen.getByTestId('custom-btn')).toBeInTheDocument();
    expect(screen.getByLabelText('custom')).toBeInTheDocument();
  });

  it('applies disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders as child element when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link button</a>
      </Button>,
    );
    const link = screen.getByRole('link');
    expect(link).toHaveTextContent('Link button');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('renders HexagonIcon for btn-hexagon variant', () => {
    render(
      <Button
        variant="btn-hexagon"
        hexagonIconAltText="hexagon"
      >
        Hex
      </Button>,
    );
    expect(screen.getByLabelText('hexagon')).toBeInTheDocument();
  });

  it('does not render HexagonIcon for non-hexagon variants', () => {
    render(<Button variant="btn-collaboration">Normal</Button>);
    expect(screen.queryByLabelText('hexagon')).not.toBeInTheDocument();
  });

  it('applies btn-ghost variant with size none by default', () => {
    render(<Button variant="btn-ghost">Ghost</Button>);
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-transparent');
    expect(button.className).toContain('hover:bg-accent');
    expect(button.className).not.toContain('h-16');
  });

  it('allows overriding size on btn-ghost variant', () => {
    render(
      <Button
        variant="btn-ghost"
        size="lg"
      >
        Ghost Large
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button.className).toContain('bg-transparent');
    expect(button.className).toContain('h-10');
    expect(button.className).toContain('px-8');
  });

  it('renders as a button element by default', () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole('button').tagName).toBe('BUTTON');
  });

  it('merges custom className with variant classes', () => {
    render(<Button className="my-custom-class">Styled</Button>);
    expect(screen.getByRole('button').className).toContain('my-custom-class');
  });

  it.each<ButtonVariant>([
    'btn-collaboration',
    'btn-organisation',
    'btn-infrastructure',
    'btn-security',
    'btn-outline',
    'btn-attention',
    'btn-small',
    'btn-table',
    'btn-ghost',
  ])('renders without errors for variant %s', (variant) => {
    render(<Button variant={variant}>Test</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has displayName set to Button', () => {
    expect(Button.displayName).toBe('Button');
  });
});
