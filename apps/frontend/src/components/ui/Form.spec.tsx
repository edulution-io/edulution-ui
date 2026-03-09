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

vi.mock('@radix-ui/react-label', () => ({
  Root: React.forwardRef(({ children, className, ...props }: any, ref: any) => (
    <label
      ref={ref}
      data-testid="label-root"
      className={className}
      {...props}
    >
      {children}
    </label>
  )),
}));

vi.mock('@radix-ui/react-slot', () => ({
  Slot: React.forwardRef(({ children, ...props }: any, ref: any) => (
    <div
      ref={ref}
      data-testid="slot"
      {...props}
    >
      {children}
    </div>
  )),
}));

vi.mock('@/components/ui/Label', () => ({
  default: React.forwardRef(({ children, className, htmlFor, ...props }: any, ref: any) => (
    <label
      ref={ref}
      data-testid="form-label"
      className={className}
      htmlFor={htmlFor}
      {...props}
    >
      {children}
    </label>
  )),
}));

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
import { useForm, FormProvider } from 'react-hook-form';
import { FormItem, FormLabel, FormControl, FormDescription, FormMessage, Form } from './Form';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({ defaultValues: { test: '' } });
  return <FormProvider {...methods}>{children}</FormProvider>;
};

const FormFieldWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({ defaultValues: { test: '' } });
  return (
    <FormProvider {...methods}>
      <FormItem>{children}</FormItem>
    </FormProvider>
  );
};

describe('Form', () => {
  it('is an alias for FormProvider', () => {
    expect(Form).toBe(FormProvider);
  });
});

describe('FormItem', () => {
  it('renders a div with children', () => {
    render(
      <Wrapper>
        <FormItem data-testid="form-item">
          <span>Field content</span>
        </FormItem>
      </Wrapper>,
    );
    expect(screen.getByTestId('form-item')).toBeInTheDocument();
    expect(screen.getByText('Field content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Wrapper>
        <FormItem
          data-testid="form-item"
          className="custom-item"
        />
      </Wrapper>,
    );
    expect(screen.getByTestId('form-item').className).toContain('custom-item');
  });
});

describe('FormDescription', () => {
  it('renders a paragraph with description text', () => {
    render(
      <FormFieldWrapper>
        <FormDescription>Help text here</FormDescription>
      </FormFieldWrapper>,
    );
    expect(screen.getByText('Help text here')).toBeInTheDocument();
  });
});
