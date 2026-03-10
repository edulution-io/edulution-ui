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

vi.mock('@edulution-io/ui-kit', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

vi.mock('@/components/ui/RadioGroupSH', () => ({
  RadioGroupSH: ({ children, value, onValueChange, className }: any) => (
    <div
      data-testid="radio-group"
      data-value={value}
      className={className}
    >
      {children}
    </div>
  ),
  RadioGroupItemSH: ({ id, value, disabled, checked, className }: any) => (
    <input
      type="radio"
      data-testid={`radio-item-${value}`}
      id={id}
      value={value}
      disabled={disabled}
      checked={checked}
      readOnly
      className={className}
    />
  ),
}));

vi.mock('@/components/ui/Form', () => ({
  FormFieldSH: ({ render, name }: any) => {
    const field = { onChange: vi.fn(), value: 'option-a', name, ref: vi.fn() };
    return render({ field });
  },
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormItem: ({ children, className }: any) => <div className={className}>{children}</div>,
  FormLabel: ({ children, htmlFor, className }: any) => (
    <label
      htmlFor={htmlFor}
      className={className}
    >
      {children}
    </label>
  ),
  FormMessage: () => <span data-testid="form-message" />,
}));

vi.mock('@/pages/Settings/AppConfig/components/defaultIconList', () => ({
  default: [],
}));

vi.mock('@/utils/getAppIconClassName', () => ({
  default: vi.fn(() => ''),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import RadioGroupFormField from './RadioGroupFormField';

const createItems = () => [
  { value: 'option-a', translationId: 'options.a', disabled: false },
  { value: 'option-b', translationId: 'options.b', disabled: false },
];

describe('RadioGroupFormField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the title from titleTranslationId', () => {
    render(
      <RadioGroupFormField
        control={{} as any}
        name="choice"
        titleTranslationId="form.title"
        items={createItems()}
      />,
    );

    expect(screen.getByText('form.title')).toBeInTheDocument();
  });

  it('renders all radio items', () => {
    render(
      <RadioGroupFormField
        control={{} as any}
        name="choice"
        items={createItems()}
      />,
    );

    expect(screen.getByText('options.a')).toBeInTheDocument();
    expect(screen.getByText('options.b')).toBeInTheDocument();
  });

  it('marks the selected item as checked', () => {
    render(
      <RadioGroupFormField
        control={{} as any}
        name="choice"
        items={createItems()}
      />,
    );

    const radioA = screen.getByTestId('radio-item-option-a');
    expect(radioA).toBeChecked();

    const radioB = screen.getByTestId('radio-item-option-b');
    expect(radioB).not.toBeChecked();
  });

  it('renders item icons when provided', () => {
    const items = [{ value: 'icon-item', translationId: 'options.icon', disabled: false, icon: '/icons/test.png' }];

    render(
      <RadioGroupFormField
        control={{} as any}
        name="choice"
        items={items}
      />,
    );

    const img = screen.getByAltText('icon-item');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/icons/test.png');
  });

  it('renders description when descriptionTranslationId is provided', () => {
    const items = [
      {
        value: 'desc-item',
        translationId: 'options.desc',
        disabled: false,
        descriptionTranslationId: 'options.descDetail',
      },
    ];

    render(
      <RadioGroupFormField
        control={{} as any}
        name="choice"
        items={items}
      />,
    );

    expect(screen.getByText('options.descDetail')).toBeInTheDocument();
  });
});
