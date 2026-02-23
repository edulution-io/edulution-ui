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
import { AccordionSH } from '@/components/ui/AccordionSH';
import Checkbox from '@/components/ui/Checkbox';
import type { SophomorixCheckResult } from '@libs/userManagement/types/sophomorixCheckResponse';
import AccordionSection from './AccordionSection';
import AddTable from './AddTable';
import UpdateTable from './UpdateTable';
import KillTable from './KillTable';

interface OverviewTabProps {
  checkResult: SophomorixCheckResult;
  addChecked: boolean;
  updateChecked: boolean;
  killChecked: boolean;
  onAddCheckedChange: () => void;
  onUpdateCheckedChange: () => void;
  onKillCheckedChange: () => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  checkResult,
  addChecked,
  updateChecked,
  killChecked,
  onAddCheckedChange,
  onUpdateCheckedChange,
  onKillCheckedChange,
}) => {
  const { t } = useTranslation();
  const addEntries = checkResult.ADD ?? {};
  const updateEntries = checkResult.UPDATE ?? {};
  const killList = checkResult.KILLLIST ?? [];
  const addCount = checkResult.ADDLIST?.length ?? 0;
  const updateCount = checkResult.UPDATELIST?.length ?? 0;
  const killCount = killList.length;
  const hasAdd = addCount > 0;
  const hasUpdate = updateCount > 0;
  const hasKill = killCount > 0;
  const hasAnyChanges = hasAdd || hasUpdate || hasKill;

  if (!hasAnyChanges) {
    return <p className="py-4 text-center text-muted-foreground">{t('usermanagement.checkResult.noChanges')}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <AccordionSH
        type="multiple"
        defaultValue={['add', 'update', 'kill']}
      >
        <AccordionSection
          value="add"
          label={t('usermanagement.checkResult.usersToAdd', { count: addCount })}
          count={addCount}
          headerClassName="bg-blue-600/20 text-blue-300"
        >
          {hasAdd ? <AddTable entries={addEntries} /> : null}
        </AccordionSection>

        <AccordionSection
          value="update"
          label={t('usermanagement.checkResult.usersToUpdate', { count: updateCount })}
          count={updateCount}
          headerClassName="bg-yellow-600/20 text-yellow-300"
        >
          {hasUpdate ? <UpdateTable entries={updateEntries} /> : null}
        </AccordionSection>

        <AccordionSection
          value="kill"
          label={t('usermanagement.checkResult.usersToDelete', { count: killCount })}
          count={killCount}
          headerClassName="bg-red-600/20 text-red-300"
        >
          {hasKill ? <KillTable logins={killList} /> : null}
        </AccordionSection>
      </AccordionSH>

      <div className="flex flex-col gap-2 pt-4">
        {hasAdd ? (
          <Checkbox
            label={t('usermanagement.checkResult.addNewUsers')}
            checked={addChecked}
            onCheckboxClick={onAddCheckedChange}
          />
        ) : null}
        {hasUpdate ? (
          <Checkbox
            label={t('usermanagement.checkResult.updateUsers')}
            checked={updateChecked}
            onCheckboxClick={onUpdateCheckedChange}
          />
        ) : null}
        {hasKill ? (
          <Checkbox
            label={t('usermanagement.checkResult.deleteUsers')}
            checked={killChecked}
            onCheckboxClick={onKillCheckedChange}
          />
        ) : null}
      </div>
    </div>
  );
};

export default OverviewTab;
