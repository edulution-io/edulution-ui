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
import type { SophomorixCheckAddEntry } from '@libs/userManagement/types/sophomorixCheckResponse';
import useOrganizationType from '@/hooks/useOrganizationType';

interface AddTableProps {
  entries: Record<string, SophomorixCheckAddEntry>;
}

const AddTable: React.FC<AddTableProps> = ({ entries }) => {
  const { t } = useTranslation();
  const { isBusiness } = useOrganizationType();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            {t(
              isBusiness
                ? 'usermanagement.checkResult.columns.classBusiness'
                : 'usermanagement.checkResult.columns.class',
            )}
          </TableHead>
          <TableHead>{t('usermanagement.checkResult.columns.login')}</TableHead>
          <TableHead>{t('usermanagement.checkResult.columns.name')}</TableHead>
          <TableHead>{t('usermanagement.checkResult.columns.role')}</TableHead>
          <TableHead>
            {t(
              isBusiness
                ? 'usermanagement.checkResult.columns.schoolBusiness'
                : 'usermanagement.checkResult.columns.school',
            )}
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Object.entries(entries).map(([login, entry]) => (
          <TableRow key={login}>
            <TableCell>{entry.sophomorixAdminClass}</TableCell>
            <TableCell>{login}</TableCell>
            <TableCell>{`${entry.givenName} ${entry.sn}`}</TableCell>
            <TableCell>{entry.sophomorixRole}</TableCell>
            <TableCell>{entry.sophomorixSchoolname}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AddTable;
