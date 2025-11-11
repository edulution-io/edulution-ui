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

import MailTheme from '@libs/mail/constants/mailTheme';
import ExtendedOptionField from '@libs/appconfig/constants/extendedOptionField';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';
import DOCKER_CONTAINER_NAMES from '@libs/docker/constants/dockerContainerNames';
import SOGO_THEME from '@libs/mail/constants/sogoTheme';

const MAIL_GENERAL_EXTENDED_OPTIONS: AppConfigExtendedOption[] = [
  {
    name: ExtendedOptionKeys.MAIL_SOGO_THEME,
    description: 'appExtendedOptions.mailSogoThemeDescription',
    title: 'appExtendedOptions.mailSogoThemeTitle',
    type: ExtendedOptionField.dropdown,
    value: MailTheme.DARK,
    width: 'full',
    options: [
      { id: MailTheme.DARK, name: 'appExtendedOptions.mailSogoTheme.dark' },
      { id: MailTheme.LIGHT, name: 'appExtendedOptions.mailSogoTheme.light' },
    ],
    requiredContainers: [DOCKER_CONTAINER_NAMES.MAILCOWDOCKERIZED_SOGO_MAILCOW_1],
    disabledWarningText: 'appExtendedOptions.mailSogoThemeDisabled',
  },
  {
    name: ExtendedOptionKeys.MAIL_SOGO_THEME_UPDATE_CHECKER,
    description: 'appExtendedOptions.mailSogoThemeUpdateCheckerDescription',
    title: 'appExtendedOptions.mailSogoThemeUpdateCheckerTitle',
    type: ExtendedOptionField.updateChecker,
    value: SOGO_THEME.VERSION_CHECK_PATH,
    width: 'full',
    requiredContainers: [DOCKER_CONTAINER_NAMES.MAILCOWDOCKERIZED_SOGO_MAILCOW_1],
  },
];

export default MAIL_GENERAL_EXTENDED_OPTIONS;
