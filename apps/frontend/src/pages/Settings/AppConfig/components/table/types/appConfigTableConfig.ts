import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import { BulletinCategoryTableStore } from '@libs/appconfig/types/bulletinCategoryTableStore';
import VeyonProxyItem from '@libs/veyon/types/veyonProxyItem';
import { VeyonConfigTableStore } from '@libs/appconfig/types/veyonConfigTableStore';
import AppConfigTableEntry from './appConfigTableEntry';

export type AppConfigTableConfig =
  | (AppConfigTableEntry<BulletinCategoryResponseDto, BulletinCategoryTableStore> & {
      type: 'bulletin';
    })
  | (AppConfigTableEntry<VeyonProxyItem, VeyonConfigTableStore> & {
      type: 'veyon';
    });
