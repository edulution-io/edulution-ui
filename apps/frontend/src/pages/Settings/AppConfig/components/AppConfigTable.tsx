import React, { SetStateAction } from 'react';
import { ColumnDef, SortingState } from '@tanstack/react-table';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import { ButtonSH } from '@/components/ui/ButtonSH';
import { useTranslation } from 'react-i18next';

interface AppConfigTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  sorting?: SortingState;
  setSorting: (sorting: SetStateAction<SortingState>) => void;
  applicationName: string;
  onButtonClick?: () => void;
}

const AppConfigTable = <TData,>({
  columns,
  data,
  sorting = [],
  setSorting,
  applicationName,
  onButtonClick,
}: AppConfigTableProps<TData>) => {
  const { t } = useTranslation();
  return (
    <div className="relative w-full overflow-hidden ">
      <div className="overflow-auto">
        <ScrollableTable
          columns={columns}
          data={data}
          sorting={sorting}
          setSorting={setSorting}
          applicationName={applicationName}
        />
      </div>

      <div className="flex justify-end pt-8">
        <ButtonSH
          onClick={onButtonClick}
          className="h-8 justify-start rounded py-0 text-left font-normal text-foreground"
          variant="outline"
        >
          {t('bulletinboard.newCategorie')}
        </ButtonSH>
      </div>
    </div>
  );
};

export default AppConfigTable;
