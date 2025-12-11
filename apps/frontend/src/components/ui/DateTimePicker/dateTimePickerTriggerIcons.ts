import { DayTimePickerModeType } from '@libs/common/types/dayTimePickerModeType';
import { CalendarIcon, ClockIcon } from 'lucide-react';
import DayTimePickerMode from '@libs/common/constants/dayTimePickerMode';

const dateTimePickerTriggerIcons: Record<DayTimePickerModeType, typeof CalendarIcon> = {
  [DayTimePickerMode.Date]: CalendarIcon,
  [DayTimePickerMode.Time]: ClockIcon,
  [DayTimePickerMode.DateTime]: CalendarIcon,
};

export default dateTimePickerTriggerIcons;
