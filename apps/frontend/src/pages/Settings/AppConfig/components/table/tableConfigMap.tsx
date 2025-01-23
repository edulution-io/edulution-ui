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
import DockerContainerTableColumns from '../../DockerIntegration/DockerContainerTableColumns';
import CreateDockerContainerDialog from '../../DockerIntegration/CreateDockerContainerDialog';
import useDockerApplicationStore from '../../DockerIntegration/useDockerApplicationStore';

const TABLE_CONFIG_MAP: AppConfigTableConfigsByAppName = {
  [APPS.BULLETIN_BOARD]: [
    createAppConfigTableEntry<BulletinCategoryResponseDto, BulletinCategoryTableStore>({
      key: APPS.BULLETIN_BOARD,
      columns: AppConfigBulletinCategoryTableColumn,
      useStore: useBulletinCategoryTableStore,
      dialogBody: <CreateAndUpdateBulletinCategoryDialog />,
      showAddButton: true,
      filterKey: 'name',
      filterPlaceHolderText: 'bulletinboard.filterPlaceHolderText',
      type: 'bulletin',
    }),
  ],
  [APPS.CLASS_MANAGEMENT]: [
    createAppConfigTableEntry<ContainerInfo, DockerContainerTableStore>({
      key: 'docker',
      columns: DockerContainerTableColumns,
      useStore: useDockerApplicationStore,
      dialogBody: <CreateDockerContainerDialog settingLocation={APPS.CLASS_MANAGEMENT} />,
      showAddButton: true,
      filterKey: 'name',
      filterPlaceHolderText: 'dockerOverview.filterPlaceHolderText',
      type: 'docker',
    }),
  ],
  [APPS.MAIL]: [
    createAppConfigTableEntry<ContainerInfo, DockerContainerTableStore>({
      key: APPS.MAIL,
      columns: DockerContainerTableColumns,
      useStore: useDockerApplicationStore,
      dialogBody: <CreateDockerContainerDialog settingLocation={APPS.MAIL} />,
      showAddButton: true,
      filterKey: 'name',
      filterPlaceHolderText: 'dockerOverview.filterPlaceHolderText',
      type: 'docker',
    }),
  ],
  [APPS.DESKTOP_DEPLOYMENT]: [
    createAppConfigTableEntry<ContainerInfo, DockerContainerTableStore>({
      key: APPS.DESKTOP_DEPLOYMENT,
      columns: DockerContainerTableColumns,
      useStore: useDockerApplicationStore,
      dialogBody: <CreateDockerContainerDialog settingLocation={APPS.DESKTOP_DEPLOYMENT} />,
      showAddButton: true,
      filterKey: 'name',
      filterPlaceHolderText: 'dockerOverview.filterPlaceHolderText',
      type: 'docker',
    }),
  ],
};

export default TABLE_CONFIG_MAP;
