/* eslint-disable max-classes-per-file */
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

export type LdapKeycloakSyncDocument = LdapKeycloakSync & Document;

@Schema({ timestamps: true, strict: true, minimize: false })
export class LdapKeycloakSync {
  @Prop({ unique: true, required: true, default: true })
  singleton: boolean;

  @Prop({ type: Date, required: true })
  lastSync: Date;

  @Prop({ default: 0 })
  schemaVersion: number;
}

export const LdapKeycloakSyncSchema = SchemaFactory.createForClass(LdapKeycloakSync);
