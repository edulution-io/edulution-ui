import TABLE_CONFIG_MAP from '@/pages/Settings/AppConfig/components/table/tableConfigMap';

type AppName = keyof typeof TABLE_CONFIG_MAP;

const getAppConfigTableConfig = (appName: AppName) => TABLE_CONFIG_MAP[appName];

export default getAppConfigTableConfig;
