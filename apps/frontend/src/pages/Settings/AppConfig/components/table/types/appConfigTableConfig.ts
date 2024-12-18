import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import { BulletinCategoryTableStore } from '@libs/appconfig/types/bulletinCategoryTableStore';
import AppConfigTableEntry from '@/pages/Settings/AppConfig/components/table/types/appConfigTableEntry';

export type AppConfigTableConfig = AppConfigTableEntry<BulletinCategoryResponseDto, BulletinCategoryTableStore>;
