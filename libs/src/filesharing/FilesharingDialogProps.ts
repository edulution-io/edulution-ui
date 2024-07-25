import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import fileSharingFromSchema from '@libs/filesharing/fileSharingFromSchema';

export type FileSharingFormValues = z.infer<typeof fileSharingFromSchema>;

export type FilesharingDialogProps = {
  form: UseFormReturn<FileSharingFormValues>;
};
