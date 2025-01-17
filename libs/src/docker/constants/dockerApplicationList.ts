import TApps from '@libs/appconfig/types/appsType';
import { type ContainerCreateOptions } from 'dockerode';

const DOCKER_APPLICATIONS: Partial<Record<TApps, ContainerCreateOptions>> = {
  mail: { name: 'edulution-mail', Image: 'edulution-mail:latest' },
  classmanagement: {
    name: 'edulution-veyon',
    Image: 'veyon/webapi-proxy:4.9.1.12',
    ExposedPorts: {
      '11080/tcp': {},
    },
    HostConfig: {
      PortBindings: {
        '11080': [
          {
            HostPort: '11080',
          },
        ],
      },
    },
  },
  desktopdeployment: { Image: '' },
} as const;

export default DOCKER_APPLICATIONS;
