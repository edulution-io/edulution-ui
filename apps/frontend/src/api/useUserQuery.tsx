import axios from 'axios';
import { IdTokenClaims } from 'oidc-client-ts';
import useEduApi from './useEduApiQuery';

const useUserQuery = () => {
  const EDU_API_ENDPOINT = 'users/login';
  const { eduApiUrl, eduApiHeaders } = useEduApi();
  const appConfigUrl = eduApiUrl + EDU_API_ENDPOINT;

  const loginUser = async (data: IdTokenClaims) => {
    await axios.post(appConfigUrl, data, eduApiHeaders);
  };

  return { loginUser };
};

export default useUserQuery;
