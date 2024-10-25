import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import getFrontEndUrl from '@libs/common/utils/getFrontEndUrl';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';

interface CallbackBaseUrlProps {
  fileName: string;
  filePath: string;
  token: string;
}

const callbackBaseUrl = ({ fileName, filePath, token }: CallbackBaseUrlProps): string =>
  `${getFrontEndUrl()}/${EDU_API_ROOT}/${FileSharingApiEndpoints.BASE}/callback?path=${filePath}&filename=${fileName}&token=${token}`;

export default callbackBaseUrl;
