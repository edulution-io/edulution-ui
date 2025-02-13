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
import { AppConfigOptions } from '@libs/appconfig/types';
import AppIntegrationType from '@libs/appconfig/types/appIntegrationType';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import ExtendedOptionKeysDto from '@libs/appconfig/types/extendedOptionKeysDto';

@Schema({ timestamps: true, strict: true, minimize: false })
export class AppConfig extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  icon: string;

  @Prop({ type: Object, default: {} })
  extendedOptions: ExtendedOptionKeysDto;

  @Prop({ required: true, type: String })
  appType: AppIntegrationType;

  @Prop({ type: Object, default: {} })
  options: AppConfigOptions;

  @Prop({ type: Array, default: [] })
  accessGroups: MultipleSelectorGroup[];

  @Prop({ default: 2 })
  schemaVersion: number;
}

export const AppConfigSchema = SchemaFactory.createForClass(AppConfig);
