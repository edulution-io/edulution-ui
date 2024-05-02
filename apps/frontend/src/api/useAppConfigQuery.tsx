import { ConfigType } from '@/datatypes/types';
import axios from 'axios';
import useEduApi from './useEduApiQuery';

const useAppConfigQuery = () => {
  const EDU_API_CONFIG_ENDPOINT = 'appconfig';
  const { eduApiUrl, eduApiHeaders } = useEduApi();
  const appConfigUrl = eduApiUrl + EDU_API_CONFIG_ENDPOINT;

  const postSettingsConfig = async (config: ConfigType[]) => {
    await axios.post(appConfigUrl, config, eduApiHeaders);
  };

  const getSettingsConfig = async (): Promise<ConfigType[] | null> => {
    const response = await axios.get(appConfigUrl, eduApiHeaders);

    return response.data as ConfigType[];
  };

  const updateSettingsConfig = async (config: ConfigType[]) => {
    await axios.put(appConfigUrl, config, eduApiHeaders);
  };

  const deleteSettingsConfigEntry = async (name: string) => {
    await axios.delete(`${appConfigUrl}/${name}`, eduApiHeaders);
  };

  return { postSettingsConfig, getSettingsConfig, updateSettingsConfig, deleteSettingsConfigEntry };
};

export default useAppConfigQuery;
