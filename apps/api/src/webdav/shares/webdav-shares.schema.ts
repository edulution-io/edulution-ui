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

export type WebdavSharesDocument = WebdavShares & Document;

@Schema()
export class WebdavShares {
  @Prop({ default: '' })
  url: string;

  @Prop({ type: Array, default: [] })
  accessGroups: MultipleSelectorGroup[];

  @Prop({ type: String, required: true, enum: WEBDAV_SHARE_TYPE, default: WEBDAV_SHARE_TYPE.LINUXMUSTER })
  type: WebdavShareType;
}

export const WebdavSharesSchema = SchemaFactory.createForClass(WebdavShares);
