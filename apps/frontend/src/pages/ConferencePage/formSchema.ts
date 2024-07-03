import { z } from 'zod';
import { TFunction } from 'i18next';

const getConferencesFormSchema = (t: TFunction<'translation', undefined>) =>
  z.object({
    name: z
      .string()
      .min(3, { message: t('conferences.min_3_chars') })
      .max(30, { message: t('conferences.max_30_chars') }),
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
