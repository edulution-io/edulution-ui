import React from 'react';
import AppConfigBulletinTableColumn from '@/pages/BulletinBoard/AppConfigBulletinTableColum';
import useAppConfigBulletinTableStore from '@/pages/BulletinBoard/useAppConfigBulletinTableStore';
import AppConfigEditBulletinCategoryDialog from '@/pages/BulletinBoard/AppConfigEditBulletinCategoryDialog';

import AppConfigTableConfigsByAppName from '@/pages/Settings/AppConfig/components/table/appConfigTableConfigsByAppName';
import APPS from '@libs/appconfig/constants/apps';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import { BulletinBoardTableStore } from '@libs/appconfig/types/bulletinBoardTableStore';
import createAppConfigTableEntry from '@/pages/Settings/AppConfig/components/table/createAppConfigTableEntry';

const TABLE_CONFIG_MAP: AppConfigTableConfigsByAppName = {
  [APPS.BULLETIN_BOARD]: [
    createAppConfigTableEntry<BulletinCategoryResponseDto, BulletinBoardTableStore>({
      key: APPS.BULLETIN_BOARD,
      columns: AppConfigBulletinTableColumn,
      useStore: useAppConfigBulletinTableStore,
      dialogBody: <AppConfigEditBulletinCategoryDialog />,
      showAddButton: true,
      filterKey: 'name',
      filterPlaceHolderText: 'bulletinboard.filterPlaceHolderText',
    }),
  ],
};

export default TABLE_CONFIG_MAP;
