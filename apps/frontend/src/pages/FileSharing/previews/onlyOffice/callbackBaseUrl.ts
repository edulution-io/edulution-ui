interface CallbackBaseUrlProps {
  fileName: string;
  filePath: string;
  isDev: boolean;
  accessToken: string;
}

const callbackBaseUrl = ({ fileName, filePath, isDev, accessToken }: CallbackBaseUrlProps): string =>
  isDev
    ? `${import.meta.env.VITE_ONLYOFFICE_DEV as string}?path=${encodeURIComponent(filePath)}&filename=${encodeURIComponent(fileName)}&eduToken=${encodeURIComponent(accessToken)}`
    : `${import.meta.env.VITE_ONLYOFFICE_DEV as string}?path=${encodeURIComponent(filePath)}&filename=${encodeURIComponent(fileName)}&eduToken=${encodeURIComponent(accessToken)}`;

export default callbackBaseUrl;
