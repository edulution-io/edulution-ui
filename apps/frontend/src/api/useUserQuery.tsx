import axios from 'axios';
import { IdTokenClaims } from 'oidc-client-ts';
import useEduApi from './useEduApiQuery';

export const USERS_EDU_API_ENDPOINT = 'users/';
const useUserQuery = () => {
  const { eduApiUrl, eduApiHeaders } = useEduApi();
  const appConfigUrl = eduApiUrl + USERS_EDU_API_ENDPOINT;

  const loginUser = async (data: IdTokenClaims) => {
    await axios.post(`${appConfigUrl}login`, data, eduApiHeaders);
  };

  return { loginUser };
};

export default useUserQuery;
