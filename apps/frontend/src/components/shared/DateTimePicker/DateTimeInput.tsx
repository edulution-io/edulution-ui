import React from 'react';
import DateTimePicker from 'react-datetime-picker';
import './DateTimePicker.css';
import './Calender.css';
import './Clock.css';
import { CalendarLight, TrashIcon } from '@/assets/icons';

type ValuePiece = Date | null;

export type TimeInputType = undefined | ValuePiece | [ValuePiece, ValuePiece];

interface DateTimeInputProps {
  value?: TimeInputType;
  onChange: (value: TimeInputType) => void;
}

const DateTimeInput = ({ value = new Date(), onChange }: DateTimeInputProps) => (
  <DateTimePicker
    value={value}
    onChange={onChange}
    calendarIcon={
      <img
        src={CalendarLight}
        alt="calendar"
        width={24}
      />
    }
    clearIcon={
      <img
        src={TrashIcon}
        alt="clear"
        width={14}
      />
    }
  />
);

export default DateTimeInput;
