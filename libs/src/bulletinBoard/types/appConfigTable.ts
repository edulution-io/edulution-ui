import type TApps from '@libs/appconfig/types/appsType';

interface AppConfigTable<T> {
  tableContentData: T[];
  fetchTableContent: (applicationName?: TApps) => Promise<void> | void;
}

export default AppConfigTable;
