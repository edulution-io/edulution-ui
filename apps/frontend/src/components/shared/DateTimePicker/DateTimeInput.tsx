import React from 'react';
import DateTimePicker from 'react-datetime-picker';
import './DateTimePicker.css';
import './Calender.css';
import './Clock.css';

type ValuePiece = Date | null;

export type TimeInputType = undefined | ValuePiece | [ValuePiece, ValuePiece];

interface DateTimeInputProps {
  value?: TimeInputType;
  onChange: (value: TimeInputType) => void;
}

const DateTimeInput = ({ value = new Date(), onChange }: DateTimeInputProps) => (
  <div>
    <DateTimePicker
      value={value}
      onChange={onChange}
    />
  </div>
);

export default DateTimeInput;
