import React, { useEffect } from 'react';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import { FLOATING_BUTTONS_BAR_ID, FOOTER_ID, NATIVE_APP_HEADER_ID } from '@libs/common/constants/pageElementIds';
import CircleLoader from '@/components/ui/CircleLoader';
import APPS from '@libs/appconfig/constants/apps';
import useDockerApplicationStore from './useDockerApplicationStore';
import DockerContainerTableColumns from './DockerContainerTableColumns';
import DockerContainerFloatingButtons from './DockerContainerFloatingButtons';

const DockerContainerTable: React.FC = () => {
  const { isLoading, containers, selectedRows, setSelectedRows, getContainers } = useDockerApplicationStore();

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
    setSelectedRows(newValue);
  };

  useEffect(() => {
    void getContainers();
  }, []);

  return (
    <div className="w-full md:w-auto md:max-w-7xl xl:max-w-full">
      <div className="absolute right-10 top-12 md:right-20 md:top-10">{isLoading ? <CircleLoader /> : null}</div>
      <ScrollableTable
        columns={DockerContainerTableColumns}
        data={containers}
        filterKey="name"
        filterPlaceHolderText="dockerOverview.filterPlaceHolderText"
        onRowSelectionChange={handleRowSelectionChange}
        selectedRows={selectedRows}
        isLoading={isLoading}
        getRowId={(originalRow) => originalRow.Id}
        applicationName={APPS.SETTINGS}
        additionalScrollContainerOffset={20}
        scrollContainerOffsetElementIds={{
          others: [NATIVE_APP_HEADER_ID, FLOATING_BUTTONS_BAR_ID, FOOTER_ID],
        }}
      />
      <DockerContainerFloatingButtons />
    </div>
  );
};

export default DockerContainerTable;
