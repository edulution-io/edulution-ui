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
