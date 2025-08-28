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

@Schema({ _id: false })
export class SchoolInfo {
  @Prop({ type: String, trim: true, default: '' })
  name: string;

  @Prop({ type: String, trim: true, default: '' })
  street: string;

  @Prop({ type: String, trim: true, default: '' })
  postalCode: string;

  @Prop({ type: String, trim: true, default: '' })
  website: string;
}

export const SchoolInfoSchema = SchemaFactory.createForClass(SchoolInfo);
