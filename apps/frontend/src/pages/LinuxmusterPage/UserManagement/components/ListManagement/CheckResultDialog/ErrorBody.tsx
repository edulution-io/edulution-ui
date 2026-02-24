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
import type { SophomorixCheckResponse } from '@libs/userManagement/types/sophomorixCheckResponse';
import SOPHOMORIX_OUTPUT_TYPES from '@libs/userManagement/constants/sophomorixOutputTypes';
import ErrorTable from './ErrorTable';

interface ErrorBodyProps {
  checkResult: SophomorixCheckResponse;
}

const ErrorBody: React.FC<ErrorBodyProps> = ({ checkResult }) => {
  const { t } = useTranslation();
  const { CHECK_RESULT, OUTPUT } = checkResult;
  const outputErrors = OUTPUT.filter((entry) => entry.TYPE === SOPHOMORIX_OUTPUT_TYPES.ERROR);
  const errorEntries = CHECK_RESULT.ERRORLIST ?? [];
  const errorDetails = CHECK_RESULT.ERROR ?? {};

  return (
    <div className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto text-base scrollbar-thin">
      <div className="rounded-lg border border-red-500 bg-red-900/20 p-4">
        <div className="mb-2 flex items-center gap-2 font-bold text-red-400">
          <FontAwesomeIcon icon={faTriangleExclamation} />
          <span>{t('usermanagement.checkResult.checkFailed')}</span>
        </div>
        {errorEntries.length > 0 ? (
          <ErrorTable
            errorEntries={errorEntries}
            errorDetails={errorDetails}
          />
        ) : null}
        {outputErrors.length > 0 ? (
          <div className="flex flex-col gap-2 text-sm">
            {outputErrors.map((entry) => {
              const message = entry.MESSAGE_EN ?? entry.MESSAGE_DE ?? '';
              return <p key={`${entry.NUMBER}-${message}`}>{message}</p>;
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ErrorBody;
