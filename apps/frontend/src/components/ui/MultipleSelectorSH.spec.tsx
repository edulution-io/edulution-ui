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

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.mock('@/hooks/useMedia', () => ({
  default: () => ({ isMobileView: false, isTabletView: false }),
}));

vi.mock('@/components/ui/BadgeSH', () => ({
  BadgeSH: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
    <span
      data-testid="badge"
      {...props}
    >
      {children}
    </span>
  ),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ className }: { className?: string }) => (
    <span
      data-testid="fa-icon"
      className={className}
    />
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MultipleSelectorSH from './MultipleSelectorSH';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';

const OPTIONS: MultipleSelectorOptionSH[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

describe('MultipleSelectorSH', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with default options and placeholder', () => {
    render(
      <MultipleSelectorSH
        defaultOptions={OPTIONS}
        placeholder="Pick fruits"
      />,
    );

    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Pick fruits');
  });

  it('shows dropdown options when input is focused', async () => {
    const user = userEvent.setup();

    render(
      <MultipleSelectorSH
        defaultOptions={OPTIONS}
        placeholder="Pick fruits"
      />,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);

    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Cherry')).toBeInTheDocument();
  });

  it('selects an option and calls onChange', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <MultipleSelectorSH
        defaultOptions={OPTIONS}
        onChange={handleChange}
        placeholder="Pick fruits"
      />,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.click(screen.getByText('Banana'));

    expect(handleChange).toHaveBeenCalledWith([{ value: 'banana', label: 'Banana' }]);
  });

  it('renders badges for selected values', () => {
    const selected: MultipleSelectorOptionSH[] = [{ value: 'apple', label: 'Apple' }];

    render(
      <MultipleSelectorSH
        defaultOptions={OPTIONS}
        value={selected}
        placeholder="Pick fruits"
      />,
    );

    const badges = screen.getAllByTestId('badge');
    expect(badges).toHaveLength(1);
    expect(badges[0]).toHaveTextContent('Apple');
  });

  it('removes a selected option via badge close button', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const selected: MultipleSelectorOptionSH[] = [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
    ];

    render(
      <MultipleSelectorSH
        defaultOptions={OPTIONS}
        value={selected}
        onChange={handleChange}
        placeholder="Pick fruits"
      />,
    );

    const closeButtons = screen.getAllByTestId('fa-icon');
    await user.click(closeButtons[0].closest('button')!);

    expect(handleChange).toHaveBeenCalledWith([{ value: 'banana', label: 'Banana' }]);
  });

  it('enforces maxSelected limit', async () => {
    const user = userEvent.setup();
    const handleMaxSelected = vi.fn();
    const handleChange = vi.fn();
    const selected: MultipleSelectorOptionSH[] = [{ value: 'apple', label: 'Apple' }];

    render(
      <MultipleSelectorSH
        defaultOptions={OPTIONS}
        value={selected}
        maxSelected={1}
        onMaxSelected={handleMaxSelected}
        onChange={handleChange}
        placeholder="Pick fruits"
      />,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.click(screen.getByText('Banana'));

    expect(handleMaxSelected).toHaveBeenCalledWith(1);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('disables input when disabled prop is true', () => {
    render(
      <MultipleSelectorSH
        defaultOptions={OPTIONS}
        disabled
        placeholder="Pick fruits"
      />,
    );

    const input = screen.getByRole('combobox');
    expect(input).toBeDisabled();
  });

  it('hides placeholder when items are selected and hidePlaceholderWhenSelected is true', () => {
    const selected: MultipleSelectorOptionSH[] = [{ value: 'apple', label: 'Apple' }];

    render(
      <MultipleSelectorSH
        defaultOptions={OPTIONS}
        value={selected}
        hidePlaceholderWhenSelected
        placeholder="Pick fruits"
      />,
    );

    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('placeholder', '');
  });

  it('shows placeholder when hidePlaceholderWhenSelected is true but nothing selected', () => {
    render(
      <MultipleSelectorSH
        defaultOptions={OPTIONS}
        hidePlaceholderWhenSelected
        placeholder="Pick fruits"
      />,
    );

    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('placeholder', 'Pick fruits');
  });

  it('creates a new item in creatable mode', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <MultipleSelectorSH
        defaultOptions={OPTIONS}
        creatable
        onChange={handleChange}
        placeholder="Pick fruits"
      />,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'Mango');

    const createOption = await screen.findByText('Create "Mango"');
    expect(createOption).toBeInTheDocument();

    await user.click(createOption);

    expect(handleChange).toHaveBeenCalledWith([{ value: 'mango', label: 'mango' }]);
  });

  it('calls onSearch when input value changes', async () => {
    const user = userEvent.setup();
    const handleSearch = vi.fn().mockResolvedValue([]);

    render(
      <MultipleSelectorSH
        onSearch={handleSearch}
        delay={100}
        placeholder="Search..."
      />,
    );

    const input = screen.getByRole('combobox');
    await user.click(input);
    await user.type(input, 'test');

    await vi.waitFor(
      () => {
        expect(handleSearch).toHaveBeenCalled();
      },
      { timeout: 3000 },
    );
  });
});
