/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect, useMemo } from 'react';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import APPS from '@libs/appconfig/constants/apps';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import useMedia from '@/hooks/useMedia';
import DOCKER_CONTAINER_TABLE_COLUMNS from '@libs/docker/constants/dockerContainerTableColumns';
import CONTAINER from '@libs/docker/constants/container';
import useDockerApplicationStore from './useDockerApplicationStore';
import DockerContainerTableColumns from './DockerContainerTableColumns';
import DockerContainerFloatingButtons from './DockerContainerFloatingButtons';

const DockerContainerTable: React.FC = () => {
  const { isMobileView, isTabletView } = useMedia();
  const { isLoading, containers, selectedRows, setSelectedRows, getContainers } = useDockerApplicationStore();
  const { t } = useTranslation();

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
    setSelectedRows(newValue);
  };

  useEffect(() => {
    void getContainers();
  }, []);

  const initialColumnVisibility = useMemo(
    () => ({
      [DOCKER_CONTAINER_TABLE_COLUMNS.CONTAINER_IMAGE]: !(isMobileView || isTabletView),
      [DOCKER_CONTAINER_TABLE_COLUMNS.CONTAINER_PORT]: !isMobileView,
      [DOCKER_CONTAINER_TABLE_COLUMNS.CONTAINER_STATUS]: !isMobileView,
      [DOCKER_CONTAINER_TABLE_COLUMNS.CONTAINER_CREATION_DATE]: !(isMobileView || isTabletView),
    }),
    [isMobileView, isTabletView],
  );

  return (
    <>
      <div className="absolute right-10 top-12 md:right-16 md:top-1">{isLoading ? <CircleLoader /> : null}</div>
      <AccordionSH
        type="multiple"
        defaultValue={[CONTAINER]}
      >
        <AccordionItem value={CONTAINER}>
          <AccordionTrigger className="flex text-h4">
            <h4>{t('dockerOverview.title')}</h4>
          </AccordionTrigger>
          <AccordionContent className="space-y-2 px-1">
            <ScrollableTable
              columns={DockerContainerTableColumns}
              data={containers}
              filterKey={DOCKER_CONTAINER_TABLE_COLUMNS.NAME}
              filterPlaceHolderText="dockerOverview.filterPlaceHolderText"
              onRowSelectionChange={handleRowSelectionChange}
              selectedRows={selectedRows}
              getRowId={(originalRow) => originalRow.Id}
              applicationName={APPS.SETTINGS}
              initialColumnVisibility={initialColumnVisibility}
            />
          </AccordionContent>
        </AccordionItem>
      </AccordionSH>
      <DockerContainerFloatingButtons />
    </>
  );
};

export default DockerContainerTable;
