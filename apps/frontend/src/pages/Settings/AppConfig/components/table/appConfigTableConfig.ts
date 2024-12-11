import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import { BulletinBoardTableStore } from '@libs/appconfig/types/bulletinBoardTableStore';
import AppConfigTableEntry from '@/pages/Settings/AppConfig/components/table/appConfigTableEntry';

export type AppConfigTableConfig = AppConfigTableEntry<BulletinCategoryResponseDto, BulletinBoardTableStore>;
