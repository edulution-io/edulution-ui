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

import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import ExtendedOptionField from '@libs/appconfig/constants/extendedOptionField';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appConfigExtendedOption';

const EMBEDDED_PAGE_EDITOR_CONFIG: AppConfigExtendedOption[] = [
  {
    name: ExtendedOptionKeys.EMBEDDED_PAGE_HTML_MODE,
    description: '',
    title: 'common.mode',
    type: ExtendedOptionField.switch,
    value: '',
    width: 'full',
  },
  {
    name: ExtendedOptionKeys.EMBEDDED_PAGE_HTML_CONTENT,
    description: 'fileTable.description',
    type: ExtendedOptionField.textarea,
    value: '',
    width: 'full',
  },
  {
    name: ExtendedOptionKeys.EMBEDDED_PAGE_TABLE,
    description: 'fileTable.description',
    type: ExtendedOptionField.table,
    value: '',
    width: 'full',
  },
  {
    name: ExtendedOptionKeys.EMBEDDED_PAGE_IS_PUBLIC,
    description: 'settings.appconfig.sections.editor.visibilityDescription',
    title: 'common.visibility',
    type: ExtendedOptionField.switch,
    value: '',
    width: 'full',
  },
];

export default EMBEDDED_PAGE_EDITOR_CONFIG;
