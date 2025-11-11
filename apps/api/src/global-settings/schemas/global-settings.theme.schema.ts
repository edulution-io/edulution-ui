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
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import DEFAULT_THEME from '@libs/global-settings/constants/defaultTheme';

@Schema({ _id: false })
export class ThemeColors {
  @Prop({ type: String, default: DEFAULT_THEME.light.primary })
  primary: string;

  @Prop({ type: String, default: DEFAULT_THEME.light.secondary })
  secondary: string;

  @Prop({ type: String, default: DEFAULT_THEME.light.ciLightGreen })
  ciLightGreen: string;

  @Prop({ type: String, default: DEFAULT_THEME.light.ciLightBlue })
  ciLightBlue: string;
}

export const ThemeColorsSchema = SchemaFactory.createForClass(ThemeColors);

@Schema({ _id: false })
export class ThemeSettings {
  @Prop({ type: ThemeColorsSchema, default: DEFAULT_THEME.light })
  light: ThemeColors;

  @Prop({ type: ThemeColorsSchema, default: DEFAULT_THEME.dark })
  dark: ThemeColors;
}

export const ThemeSettingsSchema = SchemaFactory.createForClass(ThemeSettings);
