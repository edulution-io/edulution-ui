import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

export const schema = z.object({
  filename: z.string().nonempty('Filename is required'),
});
export type FormValues = z.infer<typeof schema>;

export type FilesharingDialogProps = {
  form: UseFormReturn<FormValues>;
};
