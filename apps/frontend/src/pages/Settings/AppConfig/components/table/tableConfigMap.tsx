import AppConfigBulletinTableColumn from '@/pages/Settings/AppConfig/components/table/AppConfigBulletinTableColum';
import useAppConfigBulletinTable from '@/pages/Settings/AppConfig/components/table/useAppConfigBulletinTable';

const TABLE_CONFIG_MAP = {
  bulletinboard: [
    {
      columns: AppConfigBulletinTableColumn,
      useStore: useAppConfigBulletinTable,
    },
  ],
};

export default TABLE_CONFIG_MAP;
