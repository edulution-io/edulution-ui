interface CallbackBaseUrlProps {
  fileName: string;
  filePath: string;
  accessToken: string;
}

const callbackBaseUrl = ({ fileName, filePath, accessToken }: CallbackBaseUrlProps): string =>
  `${import.meta.env.VITE_ONLYOFFICE_CALLBACK as string}?path=${filePath}&filename=${fileName}&eduToken=${accessToken}`;

export default callbackBaseUrl;
