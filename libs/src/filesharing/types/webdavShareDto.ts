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

import { IsArray, IsBoolean, IsDate, IsMongoId, IsString } from 'class-validator';
import type MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import type WebdavShareStatusType from '@libs/webdav/types/webdavShareStatusType';
import type WebdavShareAuthenticationMethodsType from '@libs/webdav/types/webdavShareAuthenticationMethodsType';
import type MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';
import type WebdavShareType from './webdavShareType';

class WebdavShareDto {
  @IsMongoId()
  webdavShareId?: string;

  @IsString()
  displayName: string;

  @IsString()
  url: string;

  @IsString()
  sharePath: string;

  @IsString()
  pathname: string;

  @IsString()
  rootServer: string;

  @IsBoolean()
  isRootServer: boolean;

  @IsString()
  pathVariables: MultipleSelectorOptionSH[] = [];

  @IsArray()
  accessGroups: MultipleSelectorGroup[] = [];

  @IsString()
  type: WebdavShareType;

  @IsString()
  status: WebdavShareStatusType;

  @IsDate()
  lastChecked: Date | null = null;

  @IsString()
  authentication: WebdavShareAuthenticationMethodsType;
}

export default WebdavShareDto;
