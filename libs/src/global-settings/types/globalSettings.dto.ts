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

import { ValidateNested } from 'class-validator';
import type MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import type DeploymentTarget from '@libs/common/types/deployment-target';
import BrandingDto from '@libs/global-settings/types/branding.dto';
import SchoolInfoDto from '@libs/global-settings/types/schoolInfo.dto';

type GlobalSettingsAuth = {
  mfaEnforcedGroups: MultipleSelectorGroup[];
};

class GlobalSettingsDto {
  @ValidateNested()
  auth: GlobalSettingsAuth;

  @ValidateNested()
  general: {
    defaultLandingPage: {
      isCustomLandingPageEnabled: boolean | undefined;
      appName: string;
    };
    deploymentTarget: DeploymentTarget;
    ldap: {
      binduser: {
        dn: string;
        password: string;
      };
    };
  };

  branding: BrandingDto;

  schoolInfo?: SchoolInfoDto;
}

export default GlobalSettingsDto;
