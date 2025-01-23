import { stringify } from 'yaml';

const getDefaultYaml = (settingLocation: string) =>
  stringify({
    http: {
      routers: {
        [settingLocation]: {
          rule: `PathPrefix(\`/${settingLocation}1\`)`,
          service: settingLocation,
          tls: {},
          middlewares: ['strip-prefix'],
        },
      },
      middlewares: {
        'strip-prefix': {
          stripPrefix: {
            prefixes: [`/${settingLocation}1`],
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
