import React from 'react';
import AppConfigBulletinTableColumn from '@/pages/BulletinBoard/AppConfigBulletinTableColum';
import useAppConfigBulletinTableStore from '@/pages/BulletinBoard/useAppConfigBulletinTableStore';
import AppConfigEditBulletinCategoryDialog from '@/pages/BulletinBoard/AppConfigEditBulletinCategoryDialog';

import AppConfigTableConfigsByAppName from '@libs/appconfig/types/appConfigTableConfigsByAppName';

const TABLE_CONFIG_MAP: AppConfigTableConfigsByAppName = {
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
