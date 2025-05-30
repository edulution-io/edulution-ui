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

export type DefaultLandingPageDocument = DefaultLandingPage & Document;

@Schema({ _id: false })
export class DefaultLandingPage {
  @Prop({ default: false })
  isCustomLandingPageEnabled: boolean;

  @Prop({ default: '' })
  appName: string;
}

export const DefaultLandingPageSchema = SchemaFactory.createForClass(DefaultLandingPage);
