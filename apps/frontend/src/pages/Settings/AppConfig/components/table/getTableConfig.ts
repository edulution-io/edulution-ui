import TABLE_CONFIG_MAP from '@/pages/Settings/AppConfig/components/table/tableConfigMap';

const getConfig = (appName: string) => {
  if (!(appName in TABLE_CONFIG_MAP)) {
    console.error(`Invalid application name: ${appName}`);
    return null;
  }

  return TABLE_CONFIG_MAP[appName as keyof typeof TABLE_CONFIG_MAP];
};

export default getConfig;
