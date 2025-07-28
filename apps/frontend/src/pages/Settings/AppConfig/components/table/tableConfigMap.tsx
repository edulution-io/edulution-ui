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

import React from 'react';
import { type ContainerInfo } from 'dockerode';
import AppConfigBulletinCategoryTableColumn from '@/pages/Settings/AppConfig/bulletinboard/AppConfigBulletinCategoryTableColumn';
import useBulletinCategoryTableStore from '@/pages/Settings/AppConfig/bulletinboard/useBulletinCategoryTableStore';
import CreateAndUpdateBulletinCategoryDialog from '@/pages/Settings/AppConfig/bulletinboard/CreateAndUpdateBulletinCategoryDialog';
import type AppConfigTableConfigsByAppName from '@/pages/Settings/AppConfig/components/table/types/appConfigTableConfigsByAppName';
import APPS from '@libs/appconfig/constants/apps';
import type BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import { type BulletinCategoryTableStore } from '@libs/appconfig/types/bulletinCategoryTableStore';
import createAppConfigTableEntry from '@/pages/Settings/AppConfig/components/table/createAppConfigTableEntry';
import { type DockerContainerTableStore } from '@libs/appconfig/types/dockerContainerTableStore';
import VeyonProxyItem from '@libs/veyon/types/veyonProxyItem';
import { VeyonConfigTableStore } from '@libs/appconfig/types/veyonConfigTableStore';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import BULLETIN_BOARD_TABLE_COLUMNS from '@libs/appconfig/constants/bulletinBoardCategoryTableColumns';
import DOCKER_CONTAINER_TABLE_COLUMNS from '@libs/docker/constants/dockerContainerTableColumns';
import VEYON_PROXY_TABLE_COLUMNS from '@libs/classManagement/constants/veyonProxyTableColumns';
import DockerContainerTableColumns from '../../DockerIntegration/DockerContainerTableColumns';
import CreateDockerContainerDialog from '../../DockerIntegration/CreateDockerContainerDialog';
import useDockerApplicationStore from '../../DockerIntegration/useDockerApplicationStore';
import VeyonConfigTableColumns from '../../classmanagement/VeyonConfigTableColumns';
import useVeyonConfigTableStore from '../../classmanagement/useVeyonConfigTableStore';
import AddVeyonProxyDialog from '../../classmanagement/AddVeyonProxyDialog';

const DOCKER_CONTAINER_TABLE_COLUMS = {
  hideColumnsInMobileView: [
    DOCKER_CONTAINER_TABLE_COLUMNS.CONTAINER_IMAGE,
    DOCKER_CONTAINER_TABLE_COLUMNS.CONTAINER_PORT,
    DOCKER_CONTAINER_TABLE_COLUMNS.CONTAINER_STATUS,
    DOCKER_CONTAINER_TABLE_COLUMNS.CONTAINER_CREATION_DATE,
  ],
  hideColumnsInTabletView: [
    DOCKER_CONTAINER_TABLE_COLUMNS.CONTAINER_IMAGE,
    DOCKER_CONTAINER_TABLE_COLUMNS.CONTAINER_CREATION_DATE,
  ],
};

const TABLE_CONFIG_MAP: AppConfigTableConfigsByAppName = {
  [APPS.BULLETIN_BOARD]: [
    createAppConfigTableEntry<BulletinCategoryResponseDto, BulletinCategoryTableStore>({
      columns: AppConfigBulletinCategoryTableColumn,
      useStore: useBulletinCategoryTableStore,
      dialogBody: <CreateAndUpdateBulletinCategoryDialog tableId={ExtendedOptionKeys.BULLETIN_BOARD_CATEGORY_TABLE} />,
      showAddButton: true,
      filterKey: DOCKER_CONTAINER_TABLE_COLUMNS.NAME,
      filterPlaceHolderText: 'bulletinboard.filterPlaceHolderText',
      type: ExtendedOptionKeys.BULLETIN_BOARD_CATEGORY_TABLE,
      hideColumnsInMobileView: [BULLETIN_BOARD_TABLE_COLUMNS.CREATED_AT],
      hideColumnsInTabletView: [BULLETIN_BOARD_TABLE_COLUMNS.CREATED_AT],
    }),
  ],
  [APPS.CLASS_MANAGEMENT]: [
    createAppConfigTableEntry<ContainerInfo, DockerContainerTableStore>({
      columns: DockerContainerTableColumns,
      useStore: useDockerApplicationStore,
      dialogBody: (
        <CreateDockerContainerDialog
          settingLocation={APPS.CLASS_MANAGEMENT}
          tableId={ExtendedOptionKeys.DOCKER_CONTAINER_TABLE}
        />
      ),
      showAddButton: true,
      filterKey: DOCKER_CONTAINER_TABLE_COLUMNS.NAME,
      filterPlaceHolderText: 'dockerOverview.filterPlaceHolderText',
      type: ExtendedOptionKeys.DOCKER_CONTAINER_TABLE,
      ...DOCKER_CONTAINER_TABLE_COLUMS,
    }),
    createAppConfigTableEntry<VeyonProxyItem, VeyonConfigTableStore>({
      columns: VeyonConfigTableColumns,
      useStore: useVeyonConfigTableStore,
      dialogBody: <AddVeyonProxyDialog tableId={ExtendedOptionKeys.VEYON_PROXYS} />,
      showAddButton: true,
      filterKey: VEYON_PROXY_TABLE_COLUMNS.PROXY_ADDRESS,
      filterPlaceHolderText: 'settings.appconfig.sections.veyon.filterPlaceHolderText',
      type: ExtendedOptionKeys.VEYON_PROXYS,
      hideColumnsInMobileView: [],
      hideColumnsInTabletView: [],
    }),
  ],
  [APPS.MAIL]: [
    createAppConfigTableEntry<ContainerInfo, DockerContainerTableStore>({
      columns: DockerContainerTableColumns,
      useStore: useDockerApplicationStore,
      dialogBody: (
        <CreateDockerContainerDialog
          settingLocation={APPS.MAIL}
          tableId={ExtendedOptionKeys.DOCKER_CONTAINER_TABLE}
        />
      ),
      showAddButton: true,
      filterKey: DOCKER_CONTAINER_TABLE_COLUMNS.NAME,
      filterPlaceHolderText: 'dockerOverview.filterPlaceHolderText',
      type: ExtendedOptionKeys.DOCKER_CONTAINER_TABLE,
      ...DOCKER_CONTAINER_TABLE_COLUMS,
    }),
  ],
  [APPS.DESKTOP_DEPLOYMENT]: [
    createAppConfigTableEntry<ContainerInfo, DockerContainerTableStore>({
      columns: DockerContainerTableColumns,
      useStore: useDockerApplicationStore,
      dialogBody: (
        <CreateDockerContainerDialog
          settingLocation={APPS.DESKTOP_DEPLOYMENT}
          tableId={ExtendedOptionKeys.DOCKER_CONTAINER_TABLE}
        />
      ),
      showAddButton: true,
      filterKey: DOCKER_CONTAINER_TABLE_COLUMNS.NAME,
      filterPlaceHolderText: 'dockerOverview.filterPlaceHolderText',
      type: ExtendedOptionKeys.DOCKER_CONTAINER_TABLE,
      ...DOCKER_CONTAINER_TABLE_COLUMS,
    }),
  ],
  [APPS.FILE_SHARING]: [
    createAppConfigTableEntry<ContainerInfo, DockerContainerTableStore>({
      columns: DockerContainerTableColumns,
      useStore: useDockerApplicationStore,
      dialogBody: (
        <CreateDockerContainerDialog
          settingLocation={APPS.FILE_SHARING}
          tableId={ExtendedOptionKeys.DOCKER_CONTAINER_TABLE}
        />
      ),
      showAddButton: true,
      filterKey: DOCKER_CONTAINER_TABLE_COLUMNS.NAME,
      filterPlaceHolderText: 'dockerOverview.filterPlaceHolderText',
      type: ExtendedOptionKeys.DOCKER_CONTAINER_TABLE,
      ...DOCKER_CONTAINER_TABLE_COLUMS,
    }),
  ],
};

export default TABLE_CONFIG_MAP;
