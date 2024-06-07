import axios from 'axios';
import { IdTokenClaims } from 'oidc-client-ts';
import useEduApi from './useEduApiQuery';

export const USERS_EDU_API_ENDPOINT = 'users/';
export const USERS_LOGIN_EDU_API_ENDPOINT = `${USERS_EDU_API_ENDPOINT}login/`;
export const USERS_SEARCH_EDU_API_ENDPOINT = `${USERS_EDU_API_ENDPOINT}search/`;

const useUserQuery = () => {
  const { eduApiUrl, eduApiHeaders } = useEduApi();

  const loginUser = async (data: IdTokenClaims) => {
    await axios.post(`${eduApiUrl}${USERS_LOGIN_EDU_API_ENDPOINT}`, data, eduApiHeaders);
  };

  return { loginUser };
};

export default useUserQuery;
