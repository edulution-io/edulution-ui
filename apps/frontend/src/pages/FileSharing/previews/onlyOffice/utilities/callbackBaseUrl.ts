import getBackendEndUrl from '@libs/common/utils/getBackEndUrl';
import onlyOfficeUrlConfig from '@libs/filesharing/utils/onlyOfficeUrlConfig';

interface CallbackBaseUrlProps {
  fileName: string;
  filePath: string;
  accessToken: string;
}

const callbackBaseUrl = ({ fileName, filePath, accessToken }: CallbackBaseUrlProps): string => {
  const callbackUrl = `${getBackendEndUrl()}/edu-api/filesharing/callback?path=${filePath}&filename=${fileName}&eduToken=${accessToken}`;
  return callbackUrl.replace(onlyOfficeUrlConfig.localUrl, onlyOfficeUrlConfig.dockerUrl);
};

export default callbackBaseUrl;
