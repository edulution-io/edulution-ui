import AppConfigBulletinTableColumn from '@/pages/Settings/AppConfig/components/table/AppConfigBulletinTableColum';
import useAppConfigBulletinTable from '@/pages/Settings/AppConfig/components/table/useAppConfigBulletinTable';
import AppConfigBulletinTableDialog from '@/pages/Settings/AppConfig/components/table/AppConfigBulletinTableDialog';

const TABLE_CONFIG_MAP = {
  bulletinboard: [
    {
      columns: AppConfigBulletinTableColumn,
      useStore: useAppConfigBulletinTable,
      dialogBody: AppConfigBulletinTableDialog,
      showAddButton: true,
    },
  ],
};

export default TABLE_CONFIG_MAP;
