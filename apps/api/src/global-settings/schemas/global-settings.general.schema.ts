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
import { DefaultLandingPage } from './global-settings.default-landing-page.schema';

export type GeneralSettingsDocument = GeneralSettings & Document;

@Schema({ _id: false })
export class GeneralSettings {
  @Prop({ type: DefaultLandingPage })
  defaultLandingPage: DefaultLandingPage;
}

export const GeneralSettingsSchema = SchemaFactory.createForClass(GeneralSettings);
