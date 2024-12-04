import { z } from 'zod';
import { TFunction } from 'i18next';

const getBulletinFormSchema = (t: TFunction<'translation', undefined>) =>
  z.object({
    heading: z
      .string()
      .min(3, { message: t('common.min_chars', { count: 3 }) })
      .max(255, { message: t('common.max_chars', { count: 255 }) }),
    content: z
      .string()
      .min(10, { message: t('common.min_chars', { count: 10 }) })
      .max(5000, { message: t('common.max_chars', { count: 5000 }) }),
    isActive: z.boolean().optional(),
    category: z.object({
      id: z.string().uuid({ message: t('common.invalid_id') }),
      name: z.string(),
      isActive: z.boolean(),
      visibleForUsers: z
        .array(
          z.object({
            label: z.string(),
            value: z.string(),
          }),
        )
        .optional(),
      visibleForGroups: z
        .array(
          z.object({
            label: z.string(),
            value: z.string(),
          }),
        )
        .optional(),
      editableByUsers: z
        .array(
          z.object({
            label: z.string(),
            value: z.string(),
          }),
        )
        .optional(),
      editableByGroups: z
        .array(
          z.object({
            label: z.string(),
            value: z.string(),
          }),
        )
        .optional(),
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
