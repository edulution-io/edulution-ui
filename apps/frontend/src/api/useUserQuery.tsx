import axios from 'axios';
import { IdTokenClaims } from 'oidc-client-ts';
import useEduApi from './useEduApiQuery';

export const USERS_EDU_API_ENDPOINT = 'users/';
export const USERS_REGISTER_EDU_API_ENDPOINT = `${USERS_EDU_API_ENDPOINT}register/`;
export const USERS_SEARCH_EDU_API_ENDPOINT = `${USERS_EDU_API_ENDPOINT}search/`;

const useUserQuery = (): { user: (data: IdTokenClaims) => Promise<void> } => {
  const { eduApiUrl, eduApiHeaders } = useEduApi();

  const user = async (data: IdTokenClaims) => {
    await axios.post(`${eduApiUrl}${USERS_REGISTER_EDU_API_ENDPOINT}`, data, eduApiHeaders);
  };

  return { user };
};

export default useUserQuery;
