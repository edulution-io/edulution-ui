import { z } from 'zod';
import { TFunction } from 'i18next';

const getBulletinFormSchema = (t: TFunction<'translation', undefined>) =>
  z.object({
    title: z
      .string()
      .min(3, { message: t('common.min_chars', { count: 3 }) })
      .max(255, { message: t('common.max_chars', { count: 100 }) }),
    content: z.string().min(10, { message: t('common.min_chars', { count: 10 }) }),
    isActive: z.boolean(),
    category: z.object({
      id: z.string(),
      name: z.string(),
    }),
    isVisibleStartDate: z
      .date({ message: t('common.invalid_date') })
      .nullable()
      .optional(),
    isVisibleEndDate: z
      .date({ message: t('common.invalid_date') })
      .nullable()
      .optional(),
  });

export default getBulletinFormSchema;
