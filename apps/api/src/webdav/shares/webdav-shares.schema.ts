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

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import type WebdavShareType from '@libs/filesharing/types/webdavShareType';
import WEBDAV_SHARE_TYPE from '@libs/filesharing/constants/webdavShareType';
import WEBDAV_SHARE_STATUS from '@libs/webdav/constants/webdavShareStatus';
import type WebdavShareStatusType from '@libs/webdav/types/webdavShareStatusType';
import WebdavShareAuthenticationMethodsType from '@libs/webdav/types/webdavShareAuthenticationMethodsType';
import WEBDAV_SHARE_AUTHENTICATION_METHODS from '@libs/webdav/constants/webdavShareAuthenticationMethods';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';

export type WebdavSharesDocument = WebdavShares & Document;

@Schema()
export class WebdavShares {
  @Prop({ unique: true, required: true })
  displayName: string;

  @Prop({ default: '' })
  url: string;

  @Prop({ default: '' })
  sharePath: string;

  @Prop({ default: '/webdav/' })
  pathname: string;

  @Prop({ default: false })
  isRootServer: boolean;

  @Prop({ default: '' })
  rootServer: string;

  @Prop({ type: Array, default: [] })
  pathVariables: MultipleSelectorOptionSH[];

  @Prop({ type: Array, default: [] })
  accessGroups: MultipleSelectorGroup[];

  @Prop({ type: String, required: true, enum: WEBDAV_SHARE_TYPE, default: WEBDAV_SHARE_TYPE.LINUXMUSTER })
  type: WebdavShareType;

  @Prop({ type: String, enum: WEBDAV_SHARE_STATUS, default: WEBDAV_SHARE_STATUS.DOWN })
  status: WebdavShareStatusType;

  @Prop({ type: Date, default: null })
  lastChecked: Date | null;

  @Prop({ type: String, required: true, default: WEBDAV_SHARE_AUTHENTICATION_METHODS.BASIC })
  authentication: WebdavShareAuthenticationMethodsType;

  @Prop({ default: 1 })
  schemaVersion: number;
}

export const WebdavSharesSchema = SchemaFactory.createForClass(WebdavShares);

WebdavSharesSchema.set('toJSON', {
  virtuals: true,
});
