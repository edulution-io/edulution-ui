import { AppConfig } from '@/datatypes/types';
import axios from 'axios';
import useEduApi from './useEduApiQuery';

const useAppConfigQuery = () => {
  const EDU_API_CONFIG_ENDPOINT = 'appconfig';
  const { eduApiUrl, eduApiHeaders } = useEduApi();
  const appConfigUrl = eduApiUrl + EDU_API_CONFIG_ENDPOINT;

  const postAppConfigs = async (appConfig: AppConfig[]) => {
    await axios.post(appConfigUrl, appConfig, eduApiHeaders);
  };

  const getAppConfigs = async (): Promise<AppConfig[] | null> => {
    const response = await axios.get(appConfigUrl, eduApiHeaders);

    return response.data as AppConfig[];
  };

  const updateAppConfig = async (appConfig: AppConfig[]) => {
    await axios.put(appConfigUrl, appConfig, eduApiHeaders);
  };

  const deleteAppConfigEntry = async (name: string) => {
    await axios.delete(`${appConfigUrl}/${name}`, eduApiHeaders);
  };

  return { postAppConfigs, getAppConfigs, updateAppConfig, deleteAppConfigEntry };
};

export default useAppConfigQuery;
