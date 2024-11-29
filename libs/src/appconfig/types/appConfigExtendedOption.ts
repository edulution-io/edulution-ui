import { ExtendedOptionFieldType } from '@libs/appconfig/types/extendedOptionFieldType';
import { ColumnDef, SortingState } from '@tanstack/react-table';

type TableConfig<TData> = {
  columns: ColumnDef<TData>[];
  data: TData[];
  sorting: SortingState;
  setSorting: (sorting: SortingState) => void;
};

export interface AppConfigExtendedOption<TData = Record<string, unknown>> {
  name: string;
  title: string;
  description: string;
  type: ExtendedOptionFieldType;
  value: string;
  tableConfig?: TableConfig<TData>;
}
