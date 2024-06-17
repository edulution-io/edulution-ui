import axios from 'axios';
import { IdTokenClaims } from 'oidc-client-ts';
import { EDU_API_USERS_REGISTER_ENDPOINT } from '@/api/endpoints/users';
import useEduApi from './useEduApiQuery';

const useUserQuery = (): { user: (data: IdTokenClaims) => Promise<void> } => {
  const { eduApiUrl, eduApiHeaders } = useEduApi();

  const user = async (data: IdTokenClaims) => {
    await axios.post(`${eduApiUrl}${EDU_API_USERS_REGISTER_ENDPOINT}`, data, eduApiHeaders);
  };

  return { user };
};

export default useUserQuery;
