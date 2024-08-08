import { z } from 'zod';
import { t } from 'i18next';

const fileSharingFromSchema = z.object({
  filename: z.string({ required_error: t('filesharing.tooltips.folderNameRequired') }),
  extension: z.string(),
});

export default fileSharingFromSchema;
