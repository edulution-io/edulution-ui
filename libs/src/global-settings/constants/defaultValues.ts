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

import APPS from '@libs/appconfig/constants/apps';
import getDeploymentTarget from '@libs/common/utils/getDeploymentTarget';
import GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import DEFAULT_THEME from '@libs/global-settings/constants/defaultTheme';

const { LDAP_EDULUTION_BINDUSER_DN, LDAP_EDULUTION_BINDUSER_PASSWORD } = process.env as Record<string, string>;

const defaultValues: GlobalSettingsDto = {
  auth: { mfaEnforcedGroups: [], adminGroups: [] },
  general: {
    defaultLandingPage: {
      isCustomLandingPageEnabled: true,
      appName: APPS.DASHBOARD,
    },
    deploymentTarget: getDeploymentTarget(),
    ldap: {
      binduser: {
        dn: LDAP_EDULUTION_BINDUSER_DN || '',
        password: LDAP_EDULUTION_BINDUSER_PASSWORD || '',
      },
    },
  },
  organisationInfo: {
    name: '',
    street: '',
    postalCode: '',
    website: '',
  },
  theme: DEFAULT_THEME,
};

export default defaultValues;
