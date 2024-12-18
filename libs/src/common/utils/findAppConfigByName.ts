import { AppConfigDto } from '@libs/appconfig/types';

const findAppConfigByName = (appConfig: AppConfigDto[], entryName: string) =>
  appConfig.find(({ name }) => name === entryName);

export default findAppConfigByName;
