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

const mockGetAppConfigs = vi.fn();
vi.mock('@/pages/Settings/AppConfig/useAppConfigsStore', () => ({
  default: vi.fn(() => ({
    getAppConfigs: mockGetAppConfigs,
    appConfigs: [
      { name: 'app1', displayName: 'App One' },
      { name: 'app2', displayName: 'App Two' },
    ],
  })),
}));
vi.mock('@/hooks/useLanguage', () => ({
  default: () => ({ language: 'en' }),
}));
vi.mock('@/hooks/useOrganizationType', () => ({
  default: () => ({ isSchoolEnvironment: true }),
}));
vi.mock('@/utils/getDisplayName', () => ({
  default: (appConfig: any) => appConfig.displayName || appConfig.name,
}));

let capturedRender: any;
vi.mock('@/components/ui/Form', () => ({
  FormFieldSH: ({ render: renderFn, name, defaultValue, control }: any) => {
    capturedRender = renderFn;
    return (
      <div
        data-testid="form-field"
        data-name={name}
        data-default-value={defaultValue}
      >
        {renderFn({ field: { value: defaultValue || '', onChange: vi.fn() } })}
      </div>
    );
  },
  FormControl: ({ children }: any) => <div data-testid="form-control">{children}</div>,
  FormItem: ({ children }: any) => <div data-testid="form-item">{children}</div>,
}));
vi.mock('@/components', () => ({
  DropdownSelect: ({ options, selectedVal, handleChange, variant }: any) => (
    <select
      data-testid="dropdown-select"
      data-variant={variant}
      value={selectedVal}
      onChange={(e) => handleChange(e.target.value)}
    >
      {options?.map((opt: any) => (
        <option
          key={opt.id}
          value={opt.id}
        >
          {opt.name}
        </option>
      ))}
    </select>
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import AppDropdownSelectFormField from './AppDropdownSelectFormField';

const mockForm = {
  control: {},
  getValues: vi.fn(),
  setValue: vi.fn(),
} as any;

describe('AppDropdownSelectFormField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls getAppConfigs on mount', () => {
    render(
      <AppDropdownSelectFormField
        form={mockForm}
        variant="default"
      />,
    );
    expect(mockGetAppConfigs).toHaveBeenCalled();
  });

  it('renders the application label', () => {
    render(
      <AppDropdownSelectFormField
        form={mockForm}
        variant="default"
      />,
    );
    expect(screen.getByText('common.application')).toBeInTheDocument();
  });

  it('renders dropdown with app config options', () => {
    render(
      <AppDropdownSelectFormField
        form={mockForm}
        variant="default"
      />,
    );
    const dropdown = screen.getByTestId('dropdown-select');
    expect(dropdown).toBeInTheDocument();
    expect(screen.getByText('App One')).toBeInTheDocument();
    expect(screen.getByText('App Two')).toBeInTheDocument();
  });

  it('uses appName as default form field path', () => {
    render(
      <AppDropdownSelectFormField
        form={mockForm}
        variant="default"
      />,
    );
    expect(screen.getByTestId('form-field')).toHaveAttribute('data-name', 'appName');
  });

  it('uses custom appNamePath when provided', () => {
    render(
      <AppDropdownSelectFormField
        form={mockForm}
        variant="dialog"
        appNamePath={'customApp' as any}
      />,
    );
    expect(screen.getByTestId('form-field')).toHaveAttribute('data-name', 'customApp');
  });
});
