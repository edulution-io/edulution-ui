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

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import type WebdavShareType from '@libs/filesharing/types/webdavShareType';
import WEBDAV_SHARE_TYPE from '@libs/filesharing/constants/webdavShareType';
import WEBDAV_SHARE_STATUS from '@libs/webdav/constants/webdavShareStatus';
import type WebdavShareStatusType from '@libs/webdav/types/webdavShareStatusType';
import WebdavShareAuthenticationMethodsType from '@libs/webdav/types/webdavShareAuthenticationMethodsType';
import WEBDAV_SHARE_AUTHENTICATION_METHODS from '@libs/webdav/constants/webdavShareAuthenticationMethods';

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
  isRootPath: boolean;

  @Prop({ default: '' })
  rootServer: string;

  @Prop({ default: '' })
  variable: string;

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
