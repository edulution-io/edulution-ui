import { z } from 'zod';
import { TFunction } from 'i18next';

const getFileSharingFormSchema = (t: TFunction<'translation', undefined>) =>
  z.object({
    filename: z
      .string({ required_error: t('filesharing.tooltips.folderNameRequired') })
      .min(3, { message: t('fileCreateNewContent.min_3_chars') })
      .max(30, { message: t('fileCreateNewContent.max_30_chars') }),
  });

export default getFileSharingFormSchema;
