import { z } from 'zod';
import { TFunction } from 'i18next';

const getGroupFormSchema = (t: TFunction<'translation', undefined>) =>
  z.object({
    name: z
      .string()
      .min(3, { message: t('common.min_chars', { count: 3 }) })
      .max(60, { message: t('common.max_chars', { count: 60 }) })
      .regex(/^[a-z0-9_+-]*$/, { message: t('common.invalid_chars') }),
    description: z.string().max(160, { message: t('common.max_chars', { count: 160 }) }),
    join: z.boolean(),
    hide: z.boolean(),
    admins: z.array(z.any()),
    admingroups: z.array(z.any()),
    members: z.array(z.any()),
    membergroups: z.array(z.any()),
    school: z.string(),
  });

export default getGroupFormSchema;
