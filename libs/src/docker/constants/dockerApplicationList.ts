import type TApps from '@libs/appconfig/types/appsType';

type DockerApplicationList = {
  [key in TApps]: string;
};

const DOCKER_APPLICATIONS: Partial<DockerApplicationList> = {
  mail: 'edulution-mail',
  classmanagement: 'edulution-veyon',
  desktopdeployment: 'edulution-guacamole',
} as const;

export default DOCKER_APPLICATIONS;
