import { ExtendedOptionFieldType } from '@libs/appconfig/types/extendedOptionFieldType';
import { BulletinBoardConfigurationDto } from '@libs/bulletinBoard/type/BulletinBoardConfigurationDto';

type TableConfig<TData> = {
  columns: TData;
};

export interface AppConfigExtendedOption {
  name: string;
  title: string;
  description: string;
  type: ExtendedOptionFieldType;
  value: string;
  tableConfig?: TableConfig<BulletinBoardConfigurationDto>;
}
