import { TFunction } from 'i18next';
import { z } from 'zod';

const createVeyonProxyConfigSchema = (t: TFunction<'translation', undefined>) =>
  z.object({
    subnet: z
      .string()
      .regex(/^(([0-9]{1,3}\.){3}[0-9]{1,3}\/(3[0-2]|[1-2][0-9]|[0-9]))$/, {
        message: t('settings.appconfig.sections.veyon.invalidCidrFormat'),
      })
      .refine(
        (value) => {
          const [ip, prefix] = value.split('/');
          const octets = ip.split('.').map(Number);
          return (
            octets.length === 4 &&
            octets.every((octet) => octet >= 0 && octet <= 255) &&
            Number(prefix) >= 0 &&
            Number(prefix) <= 32
          );
        },
        { message: t('settings.appconfig.sections.veyon.invalidCidrFormat') },
      ),
    proxyAdress: z.string().url({ message: t('settings.appconfig.sections.veyon.invalidUrlFormat') }),
  });

export default createVeyonProxyConfigSchema;
