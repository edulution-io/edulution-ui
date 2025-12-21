/*
 * LICENSE PLACEHOLDER
 */

import { z } from 'zod';
import { ExplainabilityEvidenceSchema } from '@edulution/events';

const WhyResponseSchema = z.object({
  candidate_id: z.string().min(1),
  title: z.string().min(1),
  class: z.string().min(1),
  summary: z.string().min(1),
  evidence: z.array(ExplainabilityEvidenceSchema),
  rendered_why: z.string().min(1),
});

type WhyResponse = z.infer<typeof WhyResponseSchema>;

export { WhyResponseSchema };
export type { WhyResponse };
