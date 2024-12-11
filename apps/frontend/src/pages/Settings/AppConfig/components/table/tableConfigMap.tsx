import React from 'react';
import AppConfigBulletinTableColumn from '@/pages/BulletinBoard/AppConfigBulletinTableColum';
import useAppConfigBulletinTableStore from '@/pages/BulletinBoard/useAppConfigBulletinTableStore';
import AppConfigEditBulletinCategoryDialog from '@/pages/BulletinBoard/AppConfigEditBulletinCategoryDialog';

import AppConfigTableConfigsByAppName from '@/pages/Settings/AppConfig/components/table/appConfigTableConfigsByAppName';
import APPS from '@libs/appconfig/constants/apps';

const TABLE_CONFIG_MAP: AppConfigTableConfigsByAppName = {
  [APPS.BULLETIN_BOARD]: [
    {
      key: APPS.BULLETIN_BOARD,
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
