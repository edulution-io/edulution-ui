import { z } from 'zod';
import { TFunction } from 'i18next';
import LmnApiProjectQuota from '@libs/lmnApi/types/lmnApiProjectQuota';

const LmnApiProjectQuotaSchema = z.object({
  quota: z.number(),
  share: z.string(),
  comment: z.string().optional(),
});

const getGroupFormSchema = (t: TFunction<'translation', undefined>) =>
  z.object({
    displayName: z
      .string()
      .min(3, { message: t('common.min_chars', { count: 3 }) })
      .max(60, { message: t('common.max_chars', { count: 60 }) }),
    name: z
      .string()
      .min(3, { message: t('common.min_chars', { count: 3 }) })
      .max(60, { message: t('common.max_chars', { count: 60 }) }),
    description: z.string().max(160, { message: t('common.max_chars', { count: 160 }) }),
    join: z.boolean(),
    hide: z.boolean(),
    admins: z.array(z.any()),
    admingroups: z.array(z.any()),
    members: z.array(z.any()),
    membergroups: z.array(z.any()),
    mailquota: z.number(),
    maillist: z.boolean(),
    mailalias: z.boolean(),
    quota: z.string().refine(
      (value) => {
        try {
          const parsed = JSON.parse(value) as LmnApiProjectQuota[];
          return Array.isArray(parsed) && parsed.every((item) => LmnApiProjectQuotaSchema.safeParse(item).success);
        } catch {
          return false;
        }
      },
      { message: t('classmanagement.invalidQuota') },
    ),
    school: z.string(),
    proxyAddresses: z
      .string()
      .optional()
      .refine((value) => !value || /^([a-zA-Z0-9@.]+,)*[a-zA-Z0-9@.]+$/.test(value), {
        message: t('classmanagement.invalidProxyAddresses'),
      }),
  });

export default getGroupFormSchema;
