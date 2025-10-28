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
