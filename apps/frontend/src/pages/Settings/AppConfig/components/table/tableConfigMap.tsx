import AppConfigBulletinTableColumn from '@/pages/Settings/AppConfig/components/table/AppConfigBulletinTableColum';
import useAppConfigBulletinTable from '@/pages/Settings/AppConfig/components/table/useAppConfigBulletinTable';
import CreateBulletinCategorieTableDialog from '@/pages/Settings/AppConfig/components/table/CreateBulletinCategorieTableDialog';

const TABLE_CONFIG_MAP = {
  bulletinboard: [
    {
      key: 'bulletinboard',
      columns: AppConfigBulletinTableColumn,
      useStore: useAppConfigBulletinTable,
      dialogBody: CreateBulletinCategorieTableDialog,
      modifyBody: CreateBulletinCategorieTableDialog,
      deleteBody: CreateBulletinCategorieTableDialog,
      showAddButton: true,
    },
  ],
};

export default TABLE_CONFIG_MAP;
