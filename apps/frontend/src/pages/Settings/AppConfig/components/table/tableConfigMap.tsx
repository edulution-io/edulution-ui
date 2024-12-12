import React from 'react';
import BulletinTableColumn from '@/pages/Settings/AppConfig/bulletinboard/BulletinTableColumn';
import useBulletinCategoryTableStore from '@/pages/Settings/AppConfig/bulletinboard/useBulletinCategoryTableStore';
import CreateAndUpdateBulletinCategoryDialog from '@/pages/Settings/AppConfig/bulletinboard/CreateAndUpdateBulletinCategoryDialog';

import AppConfigTableConfigsByAppName from '@/pages/Settings/AppConfig/components/table/types/appConfigTableConfigsByAppName';
import APPS from '@libs/appconfig/constants/apps';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import { BulletinCategoryTableStore } from '@libs/appconfig/types/bulletinCategoryTableStore';
import createAppConfigTableEntry from '@/pages/Settings/AppConfig/components/table/types/createAppConfigTableEntry';

const TABLE_CONFIG_MAP: AppConfigTableConfigsByAppName = {
  [APPS.BULLETIN_BOARD]: [
    createAppConfigTableEntry<BulletinCategoryResponseDto, BulletinCategoryTableStore>({
      key: APPS.BULLETIN_BOARD,
      columns: BulletinTableColumn,
      useStore: useBulletinCategoryTableStore,
      dialogBody: <CreateAndUpdateBulletinCategoryDialog />,
      showAddButton: true,
      filterKey: 'name',
      filterPlaceHolderText: 'bulletinboard.filterPlaceHolderText',
    }),
  ],
};

export default TABLE_CONFIG_MAP;
