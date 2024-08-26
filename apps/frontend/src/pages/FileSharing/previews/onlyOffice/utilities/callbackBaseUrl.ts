import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import getFrontEndUrl from '@libs/common/utils/getFrontEndUrl';

interface CallbackBaseUrlProps {
  fileName: string;
  filePath: string;
  accessToken: string;
}

const callbackBaseUrl = ({ fileName, filePath, accessToken }: CallbackBaseUrlProps): string =>
  `${getFrontEndUrl()}/edu-api/${FileSharingApiEndpoints.BASE}/callback?path=${filePath}&filename=${fileName}&eduToken=${accessToken}`;

export default callbackBaseUrl;
