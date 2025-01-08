import APPS from '@libs/appconfig/constants/apps';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import { BulletinCategoryTableStore } from '@libs/appconfig/types/bulletinCategoryTableStore';
import VeyonProxyItem from '@libs/veyon/types/veyonProxyItem';
import { VeyonConfigTableStore } from '@libs/appconfig/types/veyonConfigTableStore';
import AppConfigTableEntry from './appConfigTableEntry';

type AppConfigTableConfigsByAppName = {
  [APPS.BULLETIN_BOARD]: AppConfigTableEntry<BulletinCategoryResponseDto, BulletinCategoryTableStore>[];
  [APPS.CLASS_MANAGEMENT]: AppConfigTableEntry<VeyonProxyItem, VeyonConfigTableStore>[];
};
export default AppConfigTableConfigsByAppName;
