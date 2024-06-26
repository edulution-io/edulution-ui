import { AxiosError, AxiosResponseHeaders, InternalAxiosRequestConfig, RawAxiosResponseHeaders } from 'axios';

interface CustomAxiosError extends AxiosError {
  response: {
    status: number;
    statusText: string;
    data: {
      message: string;
    };
    headers: RawAxiosResponseHeaders | AxiosResponseHeaders;
    config: InternalAxiosRequestConfig;
    request?: any;
  };
}

export default CustomAxiosError;
