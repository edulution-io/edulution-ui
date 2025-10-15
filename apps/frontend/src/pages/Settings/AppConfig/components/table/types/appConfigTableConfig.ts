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

import { ContainerInfo } from 'dockerode';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import { BulletinCategoryTableStore } from '@libs/appconfig/types/bulletinCategoryTableStore';
import VeyonProxyItem from '@libs/veyon/types/veyonProxyItem';
import { VeyonConfigTableStore } from '@libs/appconfig/types/veyonConfigTableStore';
import { DockerContainerTableStore } from '@libs/appconfig/types/dockerContainerTableStore';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import FileInfoDto from '@libs/appconfig/types/fileInfo.dto';
import { FileTableStore } from '@libs/appconfig/types/fileTableStore';
import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import type { WebdavServerTableStore, WebdavShareTableStore } from '@libs/appconfig/types/webdavShareTableStore';
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
    })
  | (AppConfigTableEntry<FileInfoDto, FileTableStore> & {
      type: typeof ExtendedOptionKeys.EMBEDDED_PAGE_HTML_CONTENT;
    })
  | (AppConfigTableEntry<WebdavShareDto, WebdavServerTableStore> & {
      type: typeof ExtendedOptionKeys.WEBDAV_SERVER_TABLE;
    })
  | (AppConfigTableEntry<WebdavShareDto, WebdavShareTableStore> & {
      type: typeof ExtendedOptionKeys.WEBDAV_SHARE_TABLE;
    });
