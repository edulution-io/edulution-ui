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
import { AuthSettings, AuthSettingsSchema } from './schemas/global-settings.auth.schema';
import { GeneralSettings, GeneralSettingsSchema } from './schemas/global-settings.general.schema';
import { OrganisationInfo, OrganisationInfoSchema } from './schemas/global-settings.organisation-info.schema';
import { ThemeSettings, ThemeSettingsSchema } from './schemas/global-settings.theme.schema';
import { AiConfig, AiConfigSchema } from './schemas/global-settings.ai.config.schema';

export type GlobalSettingsDocument = GlobalSettings & Document;

@Schema({ timestamps: true, strict: true, minimize: false })
export class GlobalSettings {
  @Prop({ unique: true, required: true, default: true })
  singleton: boolean;

  @Prop({ type: AuthSettingsSchema, required: true })
  auth: AuthSettings;

  @Prop({ type: GeneralSettingsSchema, required: true })
  general: GeneralSettings;

  @Prop({ type: OrganisationInfoSchema, default: {} }) organisationInfo?: OrganisationInfo;

  @Prop({ type: ThemeSettingsSchema, required: true })
  theme: ThemeSettings;

  @Prop({ type: [AiConfigSchema], default: [] })
  aiConfigs: AiConfig[];

  @Prop({ default: 8 })
  schemaVersion: number;
}

export const GlobalSettingsSchema = SchemaFactory.createForClass(GlobalSettings);
