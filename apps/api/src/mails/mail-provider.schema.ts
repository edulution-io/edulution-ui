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
import { v4 as uuidv4 } from 'uuid';
import MailEncryption from '@libs/mail/constants/mailEncryption';
import { TMailEncryption } from '@libs/mail/types';

export type MailProviderDocument = MailProvider & Document;

@Schema()
export class MailProvider {
  @Prop({ required: true, default: uuidv4() })
  mailProviderId: string;

  @Prop({ required: true, default: '' })
  name: string;

  @Prop({ required: true, default: '' })
  label: string;

  @Prop({ required: true, default: '' })
  host: string;

  @Prop({ type: String, required: true, default: '' }) port: string;

  @Prop({ type: String, required: true, default: MailEncryption.SSL })
  encryption: TMailEncryption;
}

export const MailProviderSchema = SchemaFactory.createForClass(MailProvider);
