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

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import parseCheckErrorKey, { type ParsedCheckError } from '@libs/userManagement/utils/parseCheckErrorKey';
import LIST_MANAGEMENT_COLUMNS from '@libs/userManagement/constants/listManagementColumns';
import type { ManagementListType } from '@libs/userManagement/constants/managementListTypes';

interface ErrorTableProps {
  errorEntries: string[];
  errorDetails: Record<string, { REASON: string }>;
}

type GroupedError = {
  key: string;
  parsed: ParsedCheckError;
  reason: string;
};

const ErrorTable: React.FC<ErrorTableProps> = ({ errorEntries, errorDetails }) => {
  const { t } = useTranslation();

  const groupedByType = useMemo(() => {
    const groups = new Map<ManagementListType | 'unknown', GroupedError[]>();
    errorEntries.forEach((key) => {
      const parsed = parseCheckErrorKey(key);
      const reason = errorDetails[key]?.REASON ?? '';
      const groupKey = parsed.listType ?? 'unknown';
      const existing = groups.get(groupKey) ?? [];
      existing.push({ key, parsed, reason });
      groups.set(groupKey, existing);
    });
    return groups;
  }, [errorEntries, errorDetails]);

  return (
    <div className="flex flex-col gap-4">
      {[...groupedByType.entries()].map(([listType, errors]) => {
        const columns = listType !== 'unknown' ? LIST_MANAGEMENT_COLUMNS[listType] : [];

        return (
          <div key={listType}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-2 py-1 text-left font-medium">{t('usermanagement.checkResult.columns.file')}</th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-2 py-1 text-left font-medium"
                    >
                      {t(col.translationKey)}
                    </th>
                  ))}
                  <th className="px-2 py-1 text-left font-medium">{t('usermanagement.checkResult.columns.reason')}</th>
                </tr>
              </thead>
              <tbody>
                {errors.map(({ key, parsed, reason }) => (
                  <tr
                    key={key}
                    className="border-b border-white/5"
                  >
                    <td className="px-2 py-1">{parsed.filename}</td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-2 py-1"
                      >
                        {parsed.fields[col.apiKey] ?? ''}
                      </td>
                    ))}
                    <td className="px-2 py-1 text-red-400">{reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default ErrorTable;
