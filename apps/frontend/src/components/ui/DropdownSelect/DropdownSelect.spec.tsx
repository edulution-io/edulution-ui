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

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DropdownSelect, { type DropdownOptions } from './DropdownSelect';

const TWO_OPTIONS: DropdownOptions[] = [
  { id: 'opt-1', name: 'Option A' },
  { id: 'opt-2', name: 'Option B' },
];

const FIVE_OPTIONS: DropdownOptions[] = [
  { id: 'opt-1', name: 'Alpha' },
  { id: 'opt-2', name: 'Beta' },
  { id: 'opt-3', name: 'Gamma' },
  { id: 'opt-4', name: 'Delta' },
  { id: 'opt-5', name: 'Epsilon' },
];

const defaultProps = () => ({
  options: TWO_OPTIONS,
  selectedVal: 'opt-1',
  handleChange: vi.fn(),
  translate: false,
});

describe('DropdownSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with selected value displayed', () => {
    render(<DropdownSelect {...defaultProps()} />);

    const input = screen.getByRole('combobox').querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('Option A');
  });

  it('shows placeholder when no value is selected', () => {
    const props = { ...defaultProps(), selectedVal: '', placeholder: 'common.select' };

    render(<DropdownSelect {...props} />);

    const input = screen.getByRole('combobox').querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('common.select');
  });

  it('opens menu on click showing all options', async () => {
    const user = userEvent.setup();

    render(<DropdownSelect {...defaultProps()} />);

    const input = screen.getByRole('combobox').querySelector('input') as HTMLInputElement;
    await user.click(input);

    const listbox = screen.getByRole('listbox');
    expect(listbox).toBeInTheDocument();

    const options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(2);
    expect(options[0]).toHaveTextContent('Option A');
    expect(options[1]).toHaveTextContent('Option B');
  });

  it('calls handleChange when an option is selected', async () => {
    const user = userEvent.setup();
    const props = defaultProps();

    render(<DropdownSelect {...props} />);

    const input = screen.getByRole('combobox').querySelector('input') as HTMLInputElement;
    await user.click(input);

    const listbox = screen.getByRole('listbox');
    const optionB = within(listbox).getByText('Option B');
    await user.click(optionB);

    expect(props.handleChange).toHaveBeenCalledWith('opt-2');
  });

  it('closes menu after selecting an option', async () => {
    const user = userEvent.setup();

    render(<DropdownSelect {...defaultProps()} />);

    const input = screen.getByRole('combobox').querySelector('input') as HTMLInputElement;
    await user.click(input);

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.click(screen.getByText('Option B'));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('does not call handleChange on disabled option click', async () => {
    const user = userEvent.setup();
    const options: DropdownOptions[] = [
      { id: 'opt-1', name: 'Enabled' },
      { id: 'opt-2', name: 'Disabled', disabled: true },
    ];
    const props = { ...defaultProps(), options };

    render(<DropdownSelect {...props} />);

    const input = screen.getByRole('combobox').querySelector('input') as HTMLInputElement;
    await user.click(input);

    const disabledOption = screen.getByText('Disabled');
    await user.click(disabledOption);

    expect(props.handleChange).not.toHaveBeenCalled();
  });

  it('marks disabled option with aria-disabled', async () => {
    const user = userEvent.setup();
    const options: DropdownOptions[] = [
      { id: 'opt-1', name: 'Enabled' },
      { id: 'opt-2', name: 'Disabled', disabled: true },
    ];

    render(
      <DropdownSelect
        {...defaultProps()}
        options={options}
      />,
    );

    const input = screen.getByRole('combobox').querySelector('input') as HTMLInputElement;
    await user.click(input);

    const disabledOption = screen.getByText('Disabled').closest('[role="option"]');
    expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows search input when more than 3 options', async () => {
    const user = userEvent.setup();
    const props = { ...defaultProps(), options: FIVE_OPTIONS, selectedVal: 'opt-1' };

    render(<DropdownSelect {...props} />);

    const input = screen.getByRole('combobox').querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('text');

    await user.click(input);
    await user.type(input, 'Gam');

    const listbox = screen.getByRole('listbox');
    const options = within(listbox).getAllByRole('option');
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent('Gamma');
  });

  it('shows no-results message when search finds nothing', async () => {
    const user = userEvent.setup();
    const props = { ...defaultProps(), options: FIVE_OPTIONS, selectedVal: 'opt-1' };

    render(<DropdownSelect {...props} />);

    const input = screen.getByRole('combobox').querySelector('input') as HTMLInputElement;
    await user.click(input);
    await user.type(input, 'zzzzz');

    expect(screen.getByText('search.no-results')).toBeInTheDocument();
  });

  it('marks selected option with aria-selected', async () => {
    const user = userEvent.setup();

    render(<DropdownSelect {...defaultProps()} />);

    const input = screen.getByRole('combobox').querySelector('input') as HTMLInputElement;
    await user.click(input);

    const listbox = screen.getByRole('listbox');
    const selected = within(listbox).getByRole('option', { selected: true });
    expect(selected).toHaveTextContent('Option A');
  });

  it('closes on click outside', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <button type="button">Outside</button>
        <DropdownSelect {...defaultProps()} />
      </div>,
    );

    const input = screen.getByRole('combobox').querySelector('input') as HTMLInputElement;
    await user.click(input);

    expect(screen.getByRole('listbox')).toBeInTheDocument();

    await user.click(screen.getByText('Outside'));

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('disables input when options array is empty', () => {
    const props = { ...defaultProps(), options: [] };

    render(<DropdownSelect {...props} />);

    const input = screen.getByRole('combobox').querySelector('input') as HTMLInputElement;
    expect(input).toBeDisabled();
  });
});
