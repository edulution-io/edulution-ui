import { AppConfigDto } from '@/datatypes/types';
import axios from 'axios';
import useEduApi from './useEduApiQuery';

const useAppConfigQuery = () => {
  const EDU_API_CONFIG_ENDPOINT = 'appconfig';
  const { eduApiUrl, eduApiHeaders } = useEduApi();
  const appConfigUrl = eduApiUrl + EDU_API_CONFIG_ENDPOINT;

  const postAppConfigs = async (appConfig: AppConfigDto[]) => {
    await axios.post(appConfigUrl, appConfig, eduApiHeaders);
  };

  const getAppConfigs = async (): Promise<AppConfigDto[] | null> => {
    const response = await axios.get(appConfigUrl, eduApiHeaders);

    return response.data as AppConfigDto[];
  };

  const updateAppConfig = async (appConfig: AppConfigDto[]) => {
    await axios.put(appConfigUrl, appConfig, eduApiHeaders);
  };

  const deleteAppConfigEntry = async (name: string) => {
    await axios.delete(`${appConfigUrl}/${name}`, eduApiHeaders);
  };

  return { postAppConfigs, getAppConfigs, updateAppConfig, deleteAppConfigEntry };
};

export default useAppConfigQuery;
