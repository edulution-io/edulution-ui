/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
import SelectCreateDockerContainerDialog from '@/pages/Settings/AppConfig/DockerIntegration/SelectCreateDockerContainerDialog/SelectCreateDockerContainerDialog';
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
        className="mt-5 space-y-10 [&>*]:rounded-xl [&>*]:bg-foreground [&>*]:px-2 dark:[&>*]:bg-muted-background"
      >
        <AccordionItem value={CONTAINER}>
          <AccordionTrigger>
            <h3 className="text-background">{t('dockerOverview.title')}</h3>
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
      <SelectCreateDockerContainerDialog />
      <DockerContainerFloatingButtons />
    </>
  );
};

export default DockerContainerTable;
