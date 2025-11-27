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
