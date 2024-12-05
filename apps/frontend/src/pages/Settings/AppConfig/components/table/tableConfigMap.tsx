import AppConfigBulletinTableColumn from '@/pages/BulletinBoard/AppConfigBulletinTableColum';
import useAppConfigBulletinTableStore from '@/pages/BulletinBoard/useAppConfigBulletinTableStore';
import AppConfigEditBulletinCategoryDialog from '@/pages/BulletinBoard/AppConfigEditBulletinCategoryDialog';

const TABLE_CONFIG_MAP = {
  bulletinboard: [
    {
      key: 'bulletinboard',
      columns: AppConfigBulletinTableColumn,
      useStore: useAppConfigBulletinTableStore,
      dialogBody: AppConfigEditBulletinCategoryDialog,
      modifyBody: AppConfigEditBulletinCategoryDialog,
      deleteBody: AppConfigEditBulletinCategoryDialog,
      showAddButton: true,
    },
  ],
};

export default TABLE_CONFIG_MAP;
