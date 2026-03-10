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

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
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

vi.mock('@/components/ui/BadgeSH', () => ({
  BadgeSH: ({ children, ...props }: any) => (
    <div
      data-testid="badge"
      {...props}
    >
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/Form', () => ({
  FormFieldSH: ({ render, name, control }: any) => {
    const field = { onChange: vi.fn(), value: '', name };
    return render({ field });
  },
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormItem: ({ children }: any) => <div>{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BadgeFormField from './BadgeFormField';

const createMockForm = (badges: string[] = []) =>
  ({
    control: {},
    watch: vi.fn().mockReturnValue(badges),
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

describe('BadgeFormField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders label from labelTranslationId', () => {
    const form = createMockForm([]);

    render(
      <BadgeFormField
        form={form}
        name="badges"
        labelTranslationId="form.badges"
      />,
    );

    expect(screen.getByText('form.badges')).toBeInTheDocument();
  });

  it('renders badges from form watch value', () => {
    const form = createMockForm(['Tag1', 'Tag2']);

    render(
      <BadgeFormField
        form={form}
        name="badges"
        labelTranslationId="form.badges"
      />,
    );

    expect(screen.getByText('Tag1')).toBeInTheDocument();
    expect(screen.getByText('Tag2')).toBeInTheDocument();
  });

  it('hides input when readOnly is true', () => {
    const form = createMockForm(['Tag1']);

    render(
      <BadgeFormField
        form={form}
        name="badges"
        labelTranslationId="form.badges"
        readOnly
      />,
    );

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('renders remove button for each badge', () => {
    const form = createMockForm(['Tag1', 'Tag2']);

    render(
      <BadgeFormField
        form={form}
        name="badges"
        labelTranslationId="form.badges"
      />,
    );

    const removeButtons = screen.getAllByRole('button');
    expect(removeButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('calls form.watch with the field name', () => {
    const form = createMockForm([]);

    render(
      <BadgeFormField
        form={form}
        name="myBadges"
        labelTranslationId="form.badges"
      />,
    );

    expect(form.watch).toHaveBeenCalledWith('myBadges');
  });
});
