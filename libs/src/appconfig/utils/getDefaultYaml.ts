import { stringify } from 'yaml';

const getDefaultYaml = (settingLocation: string) =>
  stringify({
    http: {
      routers: {
        [settingLocation]: {
          rule: `PathPrefix(\`/${settingLocation}\`)`,
          service: settingLocation,
          tls: {},
          middlewares: ['strip-prefix'],
        },
      },
      middlewares: {
        'strip-prefix': {
          stripPrefix: {
            prefixes: ['/api'],
          },
        },
      },
      services: {
        [settingLocation]: {
          loadBalancer: {
            servers: [{ url: '' }],
          },
        },
      },
    },
  });

export default getDefaultYaml;
