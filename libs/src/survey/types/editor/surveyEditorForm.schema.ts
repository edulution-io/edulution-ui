import { z } from 'zod';
import { TFunction } from 'i18next';

const getSurveyEditorFormSchema = (t: TFunction<'translation', undefined>) =>
  z.object({
    id: z.number(),
    formula: z.object({
      title: z.string(),
      description: z.string().optional(),
      pages: z.array(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          elements: z.array(
            z.object({
              type: z.string(),
              name: z.string(),
              description: z.string().optional(),
              isRequired: z.boolean().optional(),
              choices: z
                .array(
                  z.object({
                    value: z.string(),
                    label: z.string(),
                  }),
                )
                .optional(),
              choicesByUrl: z
                .object({
                  url: z.string(),
                })
                .optional(),
            }),
          ),
        }),
      ),
    }),
    saveNo: z.number().optional(),
    creator: z.intersection(
      z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        username: z.string(),
      }),
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    ),
    invitedAttendees: z.array(
      z.intersection(
        z.object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          username: z.string(),
        }),
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      ),
    ),
    invitedGroups: z.array(z.object({})),
    participatedAttendees: z.array(
      z.intersection(
        z.object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          username: z.string(),
        }),
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      ),
    ),
    answers: z.any(),
    created: z.date().optional(),
    expires: z
      .string()
      .nullable()
      .optional()
      .refine((val) => !val || !Number.isNaN(Date.parse(val)), { message: t('common.invalid_date') })
      .transform((val) => (val ? new Date(val).toISOString() : null)),
    isAnonymous: z.boolean().optional(),
    isPublic: z.boolean().optional(),
    canSubmitMultipleAnswers: z.boolean().optional(),
  });

export default getSurveyEditorFormSchema;
