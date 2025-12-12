interface WeekDay {
  value: number;
  labelKey: string;
}

const weekDays: WeekDay[] = [
  { value: 1, labelKey: 'common.days.mo' },
  { value: 2, labelKey: 'common.days.tu' },
  { value: 3, labelKey: 'common.days.we' },
  { value: 4, labelKey: 'common.days.th' },
  { value: 5, labelKey: 'common.days.fr' },
  { value: 6, labelKey: 'common.days.sa' },
  { value: 0, labelKey: 'common.days.su' },
];

export default weekDays;
