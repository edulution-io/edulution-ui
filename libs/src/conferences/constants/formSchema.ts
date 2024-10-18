import { z } from 'zod';
import { TFunction } from 'i18next';

const getConferencesFormSchema = (t: TFunction<'translation', undefined>) =>
  z.object({
    name: z
      .string()
      .min(3, { message: t('common.min_chars', { count: 3 }) })
      .max(60, { message: t('common.max_chars', { count: 60 }) }),
    password: z.string().optional(),
    invitedAttendees: z.array(
      z.intersection(
        z.object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          username: z.string(),
        }),
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      ),
    ),
    invitedGroups: z.array(z.object({})),
  });

export default getConferencesFormSchema;
