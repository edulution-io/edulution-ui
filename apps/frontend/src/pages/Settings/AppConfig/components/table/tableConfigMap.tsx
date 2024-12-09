import React from 'react';
import AppConfigBulletinTableColumn from '@/pages/BulletinBoard/AppConfigBulletinTableColum';
import useAppConfigBulletinTableStore from '@/pages/BulletinBoard/useAppConfigBulletinTableStore';
import AppConfigEditBulletinCategoryDialog from '@/pages/BulletinBoard/AppConfigEditBulletinCategoryDialog';
import AppConfigTableConfigMap from '@/pages/Settings/AppConfig/components/table/appConfigTableComponent';

const TABLE_CONFIG_MAP: AppConfigTableConfigMap = {
  bulletinboard: [
    {
      key: 'bulletinboard',
      columns: AppConfigBulletinTableColumn,
      useStore: useAppConfigBulletinTableStore,
      dialogBody: <AppConfigEditBulletinCategoryDialog />,
      showAddButton: true,
      filterKey: 'name',
      filterPlaceHolderText: 'bulletinboard.filterPlaceHolderText',
    },
  ],
};

export default TABLE_CONFIG_MAP;
