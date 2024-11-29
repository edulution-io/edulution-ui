import { ExtendedOptionFieldType } from '@libs/appconfig/types/extendedOptionFieldType';
import { ColumnDef } from '@tanstack/react-table';
import { BulletinBoardConfigurationDto } from '@libs/bulletinBoard/type/BulletinBoardConfigurationDto';
import { BulletinBoardTableStore } from '@/pages/Settings/AppConfig/components/table/useAppConfigBulletinTable';
import { StoreApi, UseBoundStore } from 'zustand';

type TableConfig<TData> = {
  columns: ColumnDef<TData>[];
  store: UseBoundStore<StoreApi<BulletinBoardTableStore>>;
};

export interface AppConfigExtendedOption {
  name: string;
  title: string;
  description: string;
  type: ExtendedOptionFieldType;
  value: string;
  tableConfig?: TableConfig<BulletinBoardConfigurationDto>;
}
