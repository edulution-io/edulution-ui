import TABLE_CONFIG_MAP from '@/pages/Settings/AppConfig/components/table/tableConfigMap';

const getAppConfigTableConfig = (appName: string, tableId: string) => {
  if (!(appName in TABLE_CONFIG_MAP)) {
    throw new Error(
      `Invalid application name in getAppConfigTableConfig, missing appName in TABLE_CONFIG_MAP: ${appName}`,
    );
  }

  return TABLE_CONFIG_MAP[appName as keyof typeof TABLE_CONFIG_MAP].filter(
    (tableConfig) => tableConfig.type === tableId,
  )[0];
};

export default getAppConfigTableConfig;
