import { useAuth } from 'react-oidc-context';

const useEduApi = () => {
  const { user } = useAuth();
  const accessToken = user?.access_token;
  const eduApiUrl = `${window.location.origin}/edu-api/`;
  const eduApiHeaders = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  return { eduApiUrl, eduApiHeaders };
};

export default useEduApi;
