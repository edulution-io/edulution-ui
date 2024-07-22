import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import fileSharingFromSchema from '@libs/ui/types/filesharing/FileSharingFromSchema';

export type FileSharingFormValues = z.infer<typeof fileSharingFromSchema>;

export type FilesharingDialogProps = {
  form: UseFormReturn<FileSharingFormValues>;
};
