import { TFunction } from 'i18next';
import { z } from 'zod';

const getCreateNewCategorieSchema = (t: TFunction<'translation', undefined>) =>
  z.object({
    categorieName: z
      .string()
      .min(3, { message: t('common.min_chars', { count: 3 }) })
      .max(60, { message: t('common.max_chars', { count: 60 }) }),
  });

export default getCreateNewCategorieSchema;
