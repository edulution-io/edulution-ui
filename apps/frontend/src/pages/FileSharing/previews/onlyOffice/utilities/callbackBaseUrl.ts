import getBackendEndUrl from '@libs/common/utils/getBackEndUrl';

interface CallbackBaseUrlProps {
  fileName: string;
  filePath: string;
  accessToken: string;
}

const callbackBaseUrl = ({ fileName, filePath, accessToken }: CallbackBaseUrlProps): string => {
  const callbackUrl = `${getBackendEndUrl()}/edu-api/filesharing/callback?path=${filePath}&filename=${fileName}&eduToken=${accessToken}`;
  return callbackUrl.replace('http://localhost:3001', 'http://host.docker.internal:3001');
};

export default callbackBaseUrl;
