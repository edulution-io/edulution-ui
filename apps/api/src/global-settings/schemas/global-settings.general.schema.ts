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
import type DeploymentTarget from '@libs/common/types/deployment-target';
import DEPLOYMENT_TARGET from '@libs/common/constants/deployment-target';
import { DefaultLandingPage } from './global-settings.default-landing-page.schema';
import { LdapSettings, LdapSettingsSchema } from './global-settings.ldap.settings.schema';

@Schema({ _id: false })
export class GeneralSettings {
  @Prop({ type: DefaultLandingPage })
  defaultLandingPage: DefaultLandingPage;

  @Prop({ type: String, enum: DEPLOYMENT_TARGET, default: DEPLOYMENT_TARGET.LINUXMUSTER })
  deploymentTarget: DeploymentTarget;

  @Prop({ type: LdapSettingsSchema })
  ldap: LdapSettings;
}

export const GeneralSettingsSchema = SchemaFactory.createForClass(GeneralSettings);
