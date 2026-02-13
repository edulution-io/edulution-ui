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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import type { SophomorixCheckUpdateEntry } from '@libs/userManagement/types/sophomorixCheckResponse';

interface UpdateTableProps {
  entries: Record<string, SophomorixCheckUpdateEntry>;
}

const UpdateTable: React.FC<UpdateTableProps> = ({ entries }) => {
  const { t } = useTranslation();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('usermanagement.checkResult.columns.login')}</TableHead>
          <TableHead>{t('usermanagement.checkResult.columns.changes')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(entries).map(([login, fields]) => (
          <TableRow key={login}>
            <TableCell className="align-top font-medium">{login}</TableCell>
            <TableCell>
              <ul className="list-disc pl-4">
                {Object.entries(fields).map(([field, change]) => (
                  <li key={field}>
                    <span className="italic">{field}</span>
                    {` : ${change.OLD} --> ${change.NEW}`}
                  </li>
                ))}
              </ul>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UpdateTable;
