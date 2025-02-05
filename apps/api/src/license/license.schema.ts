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

import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type LicenseDocument = License & Document;

@Schema({ strict: true })
export class License {
  @Prop({ default: '' })
  licenseKey: string;

  @Prop({ type: Date, default: new Date() })
  validFromUtc: Date;

  @Prop({ type: Date, default: '' })
  validToUtc: Date;

  @Prop({ default: false })
  isLicenseActive: boolean;
}

export const LicenseSchema = SchemaFactory.createForClass(License);
