import { UseFormReturn } from 'react-hook-form';
import FileSharingFormValues from '@libs/filesharing/types/filesharingForm';

export type FilesharingDialogProps = {
  form: UseFormReturn<FileSharingFormValues>;
};
