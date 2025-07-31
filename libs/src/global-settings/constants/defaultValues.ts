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

import getDeploymentTarget from '@libs/common/utils/getDeploymentTarget';
import GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';

const { LDAP_EDULUTION_BINDUSER_DN, LDAP_EDULUTION_BINDUSER_PASSWORD } = process.env as Record<string, string>;

const defaultValues: GlobalSettingsDto = {
  auth: { mfaEnforcedGroups: [] },
  general: {
    defaultLandingPage: {
      isCustomLandingPageEnabled: undefined,
      appName: '',
    },
    deploymentTarget: getDeploymentTarget(),
    ldap: {
      binduser: {
        dn: LDAP_EDULUTION_BINDUSER_DN || '',
        password: LDAP_EDULUTION_BINDUSER_PASSWORD || '',
      },
    },
  },
};

export default defaultValues;
