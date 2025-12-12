import { z } from 'zod';

const getDndTimeWindowFormSchema = (t: (key: string) => string) =>
  z.object({
    label: z.string().min(1, t('usersettings.notifications.dnd.validation.labelRequired')),
    days: z.array(z.number()).min(1, t('usersettings.notifications.dnd.validation.daysRequired')),
    startTime: z.string().min(1, t('usersettings.notifications.dnd.validation.startTimeRequired')),
    endTime: z.string().min(1, t('usersettings.notifications.dnd.validation.endTimeRequired')),
    bufferNotifications: z.boolean(),
  });

export default getDndTimeWindowFormSchema;
