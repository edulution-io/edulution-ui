import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import getFrontEndUrl from '@libs/common/utils/getFrontEndUrl';

interface CallbackBaseUrlProps {
  fileName: string;
  filePath: string;
  token: string;
}

const callbackBaseUrl = ({ fileName, filePath, token }: CallbackBaseUrlProps): string =>
  `${getFrontEndUrl()}/edu-api/${FileSharingApiEndpoints.BASE}/callback?path=${filePath}&filename=${fileName}&token=${token}`;

export default callbackBaseUrl;
