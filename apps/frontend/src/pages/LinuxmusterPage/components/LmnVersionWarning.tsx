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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { MIN_LMN_VERSION } from '@libs/lmnApi/utils/isLmnVersionSupported';

const LmnVersionWarning: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 border border-yellow-400 bg-yellow-50 p-4 dark:bg-yellow-900/20">
      <FontAwesomeIcon
        icon={faTriangleExclamation}
        className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
      />
      <p className="text-sm text-yellow-800 dark:text-yellow-200">
        {t('linuxmuster.versionMismatch', { version: MIN_LMN_VERSION })}
      </p>
    </div>
  );
};

export default LmnVersionWarning;
