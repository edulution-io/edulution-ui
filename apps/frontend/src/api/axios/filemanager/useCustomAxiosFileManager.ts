import { useMemo } from 'react';
import axios, { AxiosInstance } from 'axios';
import useEduApi from '@/api/useEduApiQuery.tsx';

const useCustomAxiosFileManager = (): AxiosInstance => {
  const { eduApiUrl, eduApiHeaders } = useEduApi();

  return useMemo(() => {
    return axios.create({
      baseURL: eduApiUrl + 'filemanager',
      headers: eduApiHeaders.headers,
    });
  }, [eduApiUrl, eduApiHeaders]);
};

export default useCustomAxiosFileManager;
