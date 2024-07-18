import { UseFormReturn } from 'react-hook-form';

export type FormValues = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
};

export type FilesharingDialogProps = {
  form: UseFormReturn<FormValues>;
};
