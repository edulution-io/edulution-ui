import { z } from 'zod';
import { TFunction } from 'i18next';

const getBulletinFormSchema = (t: TFunction<'translation', undefined>) =>
  z
    .object({
      title: z
        .string()
        .min(3, { message: t('common.min_chars', { count: 3 }) })
        .max(255, { message: t('common.max_chars', { count: 100 }) }),
      content: z.string().min(17, { message: t('common.min_chars', { count: 10 }) }),
      isActive: z.boolean(),
      category: z.object({
        id: z.string(),
        name: z.string(),
      }),

      isVisibleStartDate: z
        .string()
        .nullable()
        .optional()
        .refine((val) => !val || !Number.isNaN(Date.parse(val)), { message: t('common.invalid_date') })
        .transform((val) => (val ? new Date(val).toISOString() : null)),
      isVisibleEndDate: z
        .string()
        .nullable()
        .optional()
        .refine((val) => !val || !Number.isNaN(Date.parse(val)), { message: t('common.invalid_date') })
        .transform((val) => (val ? new Date(val).toISOString() : null)),
    })
    .refine(
      (data) => {
        const startDate = data.isVisibleStartDate ? new Date(data.isVisibleStartDate) : null;
        const endDate = data.isVisibleEndDate ? new Date(data.isVisibleEndDate) : null;

        if (!startDate || !endDate) {
          return true;
        }

        return startDate <= endDate;
      },
      {
        message: t('common.errors.startDateBeforeEndDate'),
        path: ['isVisibleStartDate'],
      },
    );

export default getBulletinFormSchema;
