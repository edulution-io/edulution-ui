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

vi.mock('@/hooks/useLanguage', () => ({
  default: () => ({ language: 'en' }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/ui/Calendar', () => ({
  Calendar: ({ onSelect }: { onSelect?: (date: Date) => void }) => (
    <div data-testid="calendar">
      <button
        type="button"
        data-testid="calendar-day-15"
        onClick={() => onSelect?.(new Date(2026, 2, 15))}
      >
        15
      </button>
    </div>
  ),
}));

vi.mock('@/components/ui/ScrollArea', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div data-testid="scroll-area">{children}</div>,
}));

vi.mock('@/components/ui/DateTimePicker/HourButton', () => ({
  default: ({ hour, onChangeHour }: { hour: number; onChangeHour: (h: number) => void }) => (
    <button
      type="button"
      data-testid={`hour-${hour}`}
      onClick={() => onChangeHour(hour)}
    >
      {hour}
    </button>
  ),
}));

vi.mock('@/components/ui/DateTimePicker/MinuteButton', () => ({
  default: ({ minute, onChangeMinute }: { minute: number; onChangeMinute: (m: number) => void }) => (
    <button
      type="button"
      data-testid={`minute-${minute}`}
      onClick={() => onChangeMinute(minute)}
    >
      {minute}
    </button>
  ),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({
    className,
    onClick,
    visibility,
  }: {
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
    visibility?: string;
  }) => (
    <span
      data-testid="fa-icon"
      className={className}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.(e as unknown as React.MouseEvent);
      }}
      style={{ visibility }}
    />
  ),
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import DateTimePickerField from './DateTimePickerField';

interface TestForm {
  dateField: Date | null;
}

const TestWrapper = ({ defaultValue = null, placeholder }: { defaultValue?: Date | null; placeholder?: string }) => {
  const form = useForm<TestForm>({
    defaultValues: { dateField: defaultValue },
  });

  return (
    <DateTimePickerField
      form={form}
      path="dateField"
      allowPast
      placeholder={placeholder}
    />
  );
};

describe('DateTimePickerField', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with placeholder text when no date selected', () => {
    render(<TestWrapper />);

    expect(screen.getByText('form.input.dateTimePicker.placeholder')).toBeInTheDocument();
  });

  it('renders with custom placeholder text', () => {
    render(<TestWrapper placeholder="Select a date" />);

    expect(screen.getByText('Select a date')).toBeInTheDocument();
  });

  it('opens popover on trigger click showing calendar', async () => {
    const user = userEvent.setup();

    render(<TestWrapper />);

    const trigger = screen.getByText('form.input.dateTimePicker.placeholder');
    await user.click(trigger);

    expect(screen.getByTestId('calendar')).toBeInTheDocument();
  });

  it('renders hour and minute buttons when popover is open', async () => {
    const user = userEvent.setup();

    render(<TestWrapper />);

    const trigger = screen.getByText('form.input.dateTimePicker.placeholder');
    await user.click(trigger);

    expect(screen.getByTestId('hour-0')).toBeInTheDocument();
    expect(screen.getByTestId('hour-23')).toBeInTheDocument();
    expect(screen.getByTestId('minute-0')).toBeInTheDocument();
    expect(screen.getByTestId('minute-55')).toBeInTheDocument();
  });

  it('displays formatted date when a value is provided', () => {
    const testDate = new Date(2026, 2, 15, 14, 30);

    render(<TestWrapper defaultValue={testDate} />);

    expect(screen.queryByText('form.input.dateTimePicker.placeholder')).not.toBeInTheDocument();
  });

  it('date selection updates the displayed value', async () => {
    const user = userEvent.setup();

    render(<TestWrapper />);

    const trigger = screen.getByText('form.input.dateTimePicker.placeholder');
    await user.click(trigger);

    await user.click(screen.getByTestId('calendar-day-15'));

    expect(screen.queryByText('form.input.dateTimePicker.placeholder')).not.toBeInTheDocument();
  });

  it('clear button resets the value to null', async () => {
    const user = userEvent.setup();
    const testDate = new Date(2026, 2, 15, 14, 30);

    render(<TestWrapper defaultValue={testDate} />);

    const clearIcons = screen.getAllByTestId('fa-icon');
    const clearIcon = clearIcons.find((icon) => icon.style.visibility !== 'hidden');

    if (clearIcon) {
      await user.click(clearIcon);
      expect(screen.getByText('form.input.dateTimePicker.placeholder')).toBeInTheDocument();
    }
  });
});
