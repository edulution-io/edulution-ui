import { ConfigType } from '@/datatypes/types';
import axios from 'axios';

const EDU_API_BASE_URL = 'http://localhost:3000/edu-api';
const EDU_API_CONFIG = '/config';

const useEduApi = () => {
  const postSettingsConfig = async (config: ConfigType[]) => {
    await axios.post(`${EDU_API_BASE_URL}${EDU_API_CONFIG}`, config);
  };

  const getSettingsConfig = async (): Promise<ConfigType[] | null> => {
    const response = await axios.get(`${EDU_API_BASE_URL}${EDU_API_CONFIG}`);
    return response.data as ConfigType[];
  };

  const updateSettingsConfig = async (config: ConfigType[]) => {
    await axios.put(`${EDU_API_BASE_URL}${EDU_API_CONFIG}`, config);
  };

  const deleteSettingsConfigEntry = async (name: string) => {
    await axios.delete(`${EDU_API_BASE_URL}${EDU_API_CONFIG}/${name}`);
  };

  return { postSettingsConfig, getSettingsConfig, updateSettingsConfig, deleteSettingsConfigEntry };
};

export default useEduApi;
