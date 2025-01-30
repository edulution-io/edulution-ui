import { ContainerInfo } from 'dockerode';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import { BulletinCategoryTableStore } from '@libs/appconfig/types/bulletinCategoryTableStore';
import VeyonProxyItem from '@libs/veyon/types/veyonProxyItem';
import { VeyonConfigTableStore } from '@libs/appconfig/types/veyonConfigTableStore';
import { DockerContainerTableStore } from '@libs/appconfig/types/dockerContainerTableStore';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import AppConfigTableEntry from './appConfigTableEntry';

export type AppConfigTableConfig =
  | (AppConfigTableEntry<BulletinCategoryResponseDto, BulletinCategoryTableStore> & {
      type: typeof ExtendedOptionKeys.BULLETIN_BOARD_CATEGORY_TABLE;
    })
  | (AppConfigTableEntry<ContainerInfo, DockerContainerTableStore> & {
      type: typeof ExtendedOptionKeys.DOCKER_CONTAINER_TABLE;
    })
  | (AppConfigTableEntry<VeyonProxyItem, VeyonConfigTableStore> & {
      type: typeof ExtendedOptionKeys.VEYON_PROXYS;
    });
