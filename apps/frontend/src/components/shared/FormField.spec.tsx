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
}));

vi.mock('@libs/ui/constants/commonClassNames', () => ({
  inputVariants: () => 'input-base',
}));

vi.mock('@/components/ui/Form', () => ({
  FormFieldSH: ({ render, name }: any) => {
    const field = { onChange: vi.fn(), onBlur: vi.fn(), value: '', name, ref: vi.fn() };
    return render({ field });
  },
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormMessage: ({ children }: any) => <span>{children}</span>,
  FormDescription: ({ children }: any) => <p>{children}</p>,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import FormField from './FormField';

const createMockForm = () =>
  ({
    control: {},
    watch: vi.fn(),
    getValues: vi.fn(),
    setValue: vi.fn(),
    register: vi.fn(),
    handleSubmit: vi.fn(),
    formState: { errors: {} },
    reset: vi.fn(),
    unregister: vi.fn(),
    setError: vi.fn(),
    clearErrors: vi.fn(),
    trigger: vi.fn(),
    setFocus: vi.fn(),
    getFieldState: vi.fn(),
    resetField: vi.fn(),
  }) as any;

describe('FormField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders label when labelTranslationId is provided', () => {
    const form = createMockForm();

    render(
      <FormField
        form={form}
        name="username"
        labelTranslationId="form.username"
      />,
    );

    expect(screen.getByText('form.username')).toBeInTheDocument();
  });

  it('does not render label when labelTranslationId is not provided', () => {
    const form = createMockForm();

    const { container } = render(
      <FormField
        form={form}
        name="username"
      />,
    );

    expect(container.querySelector('label')).not.toBeInTheDocument();
  });

  it('renders an input element', () => {
    const form = createMockForm();

    render(
      <FormField
        form={form}
        name="email"
        placeholder="Enter email"
      />,
    );

    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    const form = createMockForm();

    render(
      <FormField
        form={form}
        name="field"
        description="This is a helpful description"
      />,
    );

    expect(screen.getByText('This is a helpful description')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const form = createMockForm();

    const { container } = render(
      <FormField
        form={form}
        name="field"
      />,
    );

    expect(container.querySelectorAll('p').length).toBe(0);
  });

  it('disables input when disabled is true', () => {
    const form = createMockForm();

    render(
      <FormField
        form={form}
        name="field"
        disabled
        placeholder="disabled-field"
      />,
    );

    expect(screen.getByPlaceholderText('disabled-field')).toBeDisabled();
  });
});
