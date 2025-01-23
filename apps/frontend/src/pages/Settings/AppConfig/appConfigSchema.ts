import { z } from 'zod';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import APPS from '@libs/appconfig/constants/apps';
import TApps from '@libs/appconfig/types/appsType';
import i18n from '@/i18n';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';

const appIntegrationEnum = z.enum(Object.values(APP_INTEGRATION_VARIANT) as [string, ...string[]]);
const forbiddenRouts = [...Object.values(APPS), 'auth', 'edu-api'];

const appConfigFormSchema = z.record(
  z.object({
    appType: appIntegrationEnum.optional(),
    accessGroups: z.array(z.object({})).optional(),
    options: z.object({
      url: z.string().optional(),
      apiKey: z.string().optional(),
    }),
    proxyConfig: z.string().optional(),
    proxyPath: z.string().refine((val) => !forbiddenRouts.includes(val as TApps), {
      message: i18n.t('settings.errors.forbiddenProxyPath'),
    }),
    proxyDestination: z.string().optional(),
    stripPrefix: z.boolean().optional(),
    extendedOptions: z
      .object({
        [ExtendedOptionKeys.MAIL_IMAP_URL]: z.string().optional(),
        [ExtendedOptionKeys.MAIL_IMAP_PORT]: z.number().optional(),
      })
      .optional(),
    mailProviderId: z.string().optional(),
    configName: z.string().optional(),
    hostname: z.string().optional(),
    port: z.string().optional(),
    encryption: z.string().optional(),
  }),
);

export default appConfigFormSchema;
