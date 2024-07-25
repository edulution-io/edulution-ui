import { z } from 'zod';

const InferredFormValues = z.object({
  filename: z.string(),
});
type FileSharingFormValues = z.infer<typeof InferredFormValues>;
export default FileSharingFormValues;
