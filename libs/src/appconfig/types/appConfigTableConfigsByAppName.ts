import APPS from '@libs/appconfig/constants/apps';
import { AppConfigTableConfig } from '@/pages/Settings/AppConfig/components/table/appConfigTableConfig';

type AppConfigTableConfigsByAppName = {
  [APPS.BULLETIN_BOARD]: AppConfigTableConfig[];
};
export default AppConfigTableConfigsByAppName;
