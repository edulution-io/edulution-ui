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
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
  inputVariants: () => 'input-base',
  Input: React.forwardRef<HTMLInputElement, any>(({ variant, shouldTrim, icon, ...props }, ref) => (
    <input
      ref={ref}
      data-testid="mock-input"
      {...props}
    />
  )),
}));

vi.mock('@/components/ui/Label', () => ({
  default: ({ children }: any) => <label>{children}</label>,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Field from './Field';

describe('Field', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input with value', () => {
    render(<Field value="Hello" />);

    const input = screen.getByDisplayValue('Hello');
    expect(input).toBeInTheDocument();
  });

  it('renders label when labelTranslationId is provided', () => {
    render(
      <Field
        value="test"
        labelTranslationId="field.name"
      />,
    );

    expect(screen.getByText('field.name')).toBeInTheDocument();
  });

  it('does not render label when labelTranslationId is not provided', () => {
    const { container } = render(<Field value="test" />);

    expect(container.querySelector('label')).not.toBeInTheDocument();
  });

  it('displays "common.not-available" when value is empty', () => {
    render(<Field />);

    const input = screen.getByDisplayValue('common.not-available');
    expect(input).toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    render(
      <Field
        value="test"
        disabled
      />,
    );

    const input = screen.getByDisplayValue('test');
    expect(input).toBeDisabled();
  });

  it('disables input when isLoading prop is true', () => {
    render(
      <Field
        value="test"
        isLoading
      />,
    );

    const input = screen.getByDisplayValue('test');
    expect(input).toBeDisabled();
  });

  it('calls onChange when typing in the input', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Field onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'a');

    expect(handleChange).toHaveBeenCalled();
  });
});
