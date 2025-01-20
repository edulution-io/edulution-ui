import React, { useEffect } from 'react';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import { FLOATING_BUTTONS_BAR_ID, FOOTER_ID, NATIVE_APP_HEADER_ID } from '@libs/common/constants/pageElementIds';
import APPS from '@libs/appconfig/constants/apps';
import useDockerApplicationStore from './useDockerApplicationStore';
import DockerContainerTableColumns from './DockerContainerTableColumns';
import DockerContainerFloatingButtons from './DockerContainerFloatingButtons';

const DockerContainerTable = () => {
  const { isLoading, containers, selectedRows, setSelectedRows, fetchContainers } = useDockerApplicationStore();

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
    setSelectedRows(newValue);
  };

  useEffect(() => {
    void fetchContainers();
  }, []);

  return (
    <div className="w-full md:w-auto md:max-w-7xl xl:max-w-full">
      <ScrollableTable
        columns={DockerContainerTableColumns}
        data={containers}
        filterKey="container-name"
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
