import { t } from 'i18next';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

export const schema = z.object({
  filename: z.string().nonempty(t('filesharing.tooltips.folderNameRequired')),
});
export type FileSharingFormValues = z.infer<typeof schema>;

export type FilesharingDialogProps = {
  form: UseFormReturn<FileSharingFormValues>;
};
