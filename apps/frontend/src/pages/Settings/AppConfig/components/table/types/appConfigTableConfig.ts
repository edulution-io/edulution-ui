import { ContainerInfo } from 'dockerode';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import { BulletinCategoryTableStore } from '@libs/appconfig/types/bulletinCategoryTableStore';
import AppConfigTableEntry from '@/pages/Settings/AppConfig/components/table/types/appConfigTableEntry';
import { DockerContainerTableStore } from '@libs/appconfig/types/dockerContainerTableStore';

export type AppConfigTableConfig =
  | (AppConfigTableEntry<BulletinCategoryResponseDto, BulletinCategoryTableStore> & {
      type: 'bulletin';
    })
  | (AppConfigTableEntry<ContainerInfo, DockerContainerTableStore> & {
      type: 'docker';
    });
