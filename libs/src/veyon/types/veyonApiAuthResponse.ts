// This type is based on a third-party object definition from veyon web-API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.

import VEYON_API_AUTH_RESPONSE_KEYS from '../constants/veyonApiAuthResponse';

type VeyonApiAuthResponse = {
  [VEYON_API_AUTH_RESPONSE_KEYS.CONNECTION_UID]: string;
  [VEYON_API_AUTH_RESPONSE_KEYS.VALID_UNTIL]: number;
};

export default VeyonApiAuthResponse;
