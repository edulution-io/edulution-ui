import React from 'react';
import BulletinTableColumn from '@/pages/Settings/AppConfig/bulletinboard/BulletinTableColumn';
import useBulletinCategoryTableStore from '@/pages/Settings/AppConfig/bulletinboard/useBulletinCategoryTableStore';
import CreateAndUpdateBulletinCategoryDialog from '@/pages/Settings/AppConfig/bulletinboard/CreateAndUpdateBulletinCategoryDialog';
import AppConfigTableConfigsByAppName from '@/pages/Settings/AppConfig/components/table/types/appConfigTableConfigsByAppName';
import APPS from '@libs/appconfig/constants/apps';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import { BulletinCategoryTableStore } from '@libs/appconfig/types/bulletinCategoryTableStore';
import createAppConfigTableEntry from '@/pages/Settings/AppConfig/components/table/createAppConfigTableEntry';
import { VeyonConfigTableStore } from '@libs/appconfig/types/veyonConfigTableStore';
import VeyonProxyItem from '@libs/veyon/types/veyonProxyItem';
import useVeyonConfigTableStore from '@/pages/Settings/AppConfig/classmgmt/useVeyonTableStore';
import VeyonConfigTableColumns from '@/pages/Settings/AppConfig/classmgmt/VeyonConfigTableColumns';
import AddVeyonProxyDialog from '@/pages/Settings/AppConfig/classmgmt/AddVeyonProxyDialog';

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
      type: 'bulletin',
    }),
  ],
  [APPS.CLASS_MANAGEMENT]: [
    createAppConfigTableEntry<VeyonProxyItem, VeyonConfigTableStore>({
      key: APPS.CLASS_MANAGEMENT,
      columns: VeyonConfigTableColumns,
      useStore: useVeyonConfigTableStore,
      dialogBody: <AddVeyonProxyDialog />,
      showAddButton: true,
      filterKey: 'proxyAdress',
      filterPlaceHolderText: 'settings.appconfig.sections.veyon.filterPlaceHolderText',
      type: 'veyon',
    }),
  ],
};

export default TABLE_CONFIG_MAP;
