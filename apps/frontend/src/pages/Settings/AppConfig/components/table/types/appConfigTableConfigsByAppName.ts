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

import { type ContainerInfo } from 'dockerode';
import APPS from '@libs/appconfig/constants/apps';
import type BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import { type BulletinCategoryTableStore } from '@libs/appconfig/types/bulletinCategoryTableStore';
import { type DockerContainerTableStore } from '@libs/appconfig/types/dockerContainerTableStore';
import type VeyonProxyItem from '@libs/veyon/types/veyonProxyItem';
import { type VeyonConfigTableStore } from '@libs/appconfig/types/veyonConfigTableStore';
import { type FileTableStore } from '@libs/appconfig/types/fileTableStore';
import type FileInfoDto from '@libs/appconfig/types/fileInfo.dto';
import type WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import { type WebdavServerTableStore, type WebdavShareTableStore } from '@libs/appconfig/types/webdavShareTableStore';
import type AppConfigTableEntry from './appConfigTableEntry';

type AllowedTableEntry =
  | AppConfigTableEntry<BulletinCategoryResponseDto, BulletinCategoryTableStore>
  | AppConfigTableEntry<ContainerInfo, DockerContainerTableStore>
  | AppConfigTableEntry<VeyonProxyItem, VeyonConfigTableStore>
  | AppConfigTableEntry<FileInfoDto, FileTableStore>
  | AppConfigTableEntry<WebdavShareDto, WebdavServerTableStore>
  | AppConfigTableEntry<WebdavShareDto, WebdavShareTableStore>;

type AppConfigTableConfigsByAppName = {
  [APPS.BULLETIN_BOARD]: AppConfigTableEntry<BulletinCategoryResponseDto, BulletinCategoryTableStore>[];
  [APPS.CLASS_MANAGEMENT]: (
    | AppConfigTableEntry<ContainerInfo, DockerContainerTableStore>
    | AppConfigTableEntry<VeyonProxyItem, VeyonConfigTableStore>
  )[];
  [APPS.MAIL]: AppConfigTableEntry<ContainerInfo, DockerContainerTableStore>[];
  [APPS.DESKTOP_DEPLOYMENT]: AppConfigTableEntry<ContainerInfo, DockerContainerTableStore>[];
  [APPS.FILE_SHARING]: (
    | AppConfigTableEntry<ContainerInfo, DockerContainerTableStore>
    | AppConfigTableEntry<WebdavShareDto, WebdavServerTableStore>
    | AppConfigTableEntry<WebdavShareDto, WebdavShareTableStore>
  )[];
} & {
  [key: string]: AllowedTableEntry[];
};

export default AppConfigTableConfigsByAppName;
