import AppConfigBulletinTableColumn from '@/pages/BulletinBoard/AppConfigBulletinTableColum';
import useAppConfigBulletinTableStore from '@/pages/BulletinBoard/useAppConfigBulletinTableStore';
import CreateBulletinCategorieTableDialog from '@/pages/BulletinBoard/CreateBulletinCategorieTableDialog';

const TABLE_CONFIG_MAP = {
  bulletinboard: [
    {
      key: 'bulletinboard',
      columns: AppConfigBulletinTableColumn,
      useStore: useAppConfigBulletinTableStore,
      dialogBody: CreateBulletinCategorieTableDialog,
      modifyBody: CreateBulletinCategorieTableDialog,
      deleteBody: CreateBulletinCategorieTableDialog,
      showAddButton: true,
    },
  ],
};

export default TABLE_CONFIG_MAP;
