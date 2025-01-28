import { type ContainerInfo } from 'dockerode';
import APPS from '@libs/appconfig/constants/apps';
import type BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import { type BulletinCategoryTableStore } from '@libs/appconfig/types/bulletinCategoryTableStore';
import { type DockerContainerTableStore } from '@libs/appconfig/types/dockerContainerTableStore';
import VeyonProxyItem from '@libs/veyon/types/veyonProxyItem';
import { VeyonConfigTableStore } from '@libs/appconfig/types/veyonConfigTableStore';
import type AppConfigTableEntry from './appConfigTableEntry';

type AppConfigTableConfigsByAppName = {
  [APPS.BULLETIN_BOARD]: AppConfigTableEntry<BulletinCategoryResponseDto, BulletinCategoryTableStore>[];
  [APPS.CLASS_MANAGEMENT]: (
    | AppConfigTableEntry<ContainerInfo, DockerContainerTableStore>
    | AppConfigTableEntry<VeyonProxyItem, VeyonConfigTableStore>
  )[];
  [APPS.MAIL]: AppConfigTableEntry<ContainerInfo, DockerContainerTableStore>[];
  [APPS.DESKTOP_DEPLOYMENT]: AppConfigTableEntry<ContainerInfo, DockerContainerTableStore>[];
};
export default AppConfigTableConfigsByAppName;
