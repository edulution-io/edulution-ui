import { ConfigType } from '@/datatypes/types';
import axios from 'axios';
import { useAuth } from 'react-oidc-context';

const EDU_API_BASE_URL = 'http://localhost:5173/edu-api';
const EDU_API_CONFIG = '/config';

const useEduApi = () => {
  const { user } = useAuth();
  const accessToken = user?.access_token;
  const configUrl = `${EDU_API_BASE_URL}${EDU_API_CONFIG}`;
  const requerstHeaders = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const postSettingsConfig = async (config: ConfigType[]) => {
    await axios.post(configUrl, config, requerstHeaders);
  };

  const getSettingsConfig = async (): Promise<ConfigType[] | null> => {
    const response = await axios.get(configUrl, requerstHeaders);

    return response.data as ConfigType[];
  };

  const updateSettingsConfig = async (config: ConfigType[]) => {
    await axios.put(configUrl, config, requerstHeaders);
  };

  const deleteSettingsConfigEntry = async (name: string) => {
    await axios.delete(`${configUrl}/${name}`, requerstHeaders);
  };

  return { postSettingsConfig, getSettingsConfig, updateSettingsConfig, deleteSettingsConfigEntry };
};

export default useEduApi;
