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

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model } from 'mongoose';
import { type AppConfigOptions } from '@libs/appconfig/types/appConfigOptionsType';
import type AppIntegrationType from '@libs/appconfig/types/appIntegrationType';
import type MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import type ExtendedOptionKeysDto from '@libs/appconfig/types/extendedOptionKeysDto';
import type AppNameTranslations from '@libs/appconfig/types/appNameTranslations';

@Schema({ timestamps: true, strict: true, minimize: false })
export class AppConfig extends Document {
  @Prop({ unique: true, required: true })
  name: string;

  @Prop({ type: Object, default: {} })
  translations: AppNameTranslations;

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

  @Prop({ type: Number, required: true })
  position: number;

  @Prop({ default: 6 })
  schemaVersion: number;
}

export const AppConfigSchema = SchemaFactory.createForClass(AppConfig);

AppConfigSchema.pre<AppConfig>('save', async function countPosition(next) {
  if (this.isNew && !this.position) {
    const model = this.constructor as Model<AppConfig>;
    const count = await model.countDocuments();
    this.position = count + 1;
  }
  next();
});
