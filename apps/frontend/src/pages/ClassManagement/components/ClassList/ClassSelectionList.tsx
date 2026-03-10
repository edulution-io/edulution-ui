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

import React, { ReactNode } from 'react';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import GroupColumn from '@libs/groups/types/groupColumn';
import { useTranslation } from 'react-i18next';
import useLdapGroups from '@/hooks/useLdapGroups';
import useSchoolStore from '@/store/useSchoolStore';
import ClassSelectionCard from './ClassSelectionCard';

interface ClassSelectionListProps {
  row: Omit<GroupColumn, 'icon'>;
  selectedClasses: LmnApiSchoolClass[];
  setSelectedClasses: React.Dispatch<React.SetStateAction<LmnApiSchoolClass[]>>;
  activeSchool: string | null;
  floatingBar: ReactNode;
  onPdfClick: (group: LmnApiSchoolClass) => void;
  onCsvClick: (group: LmnApiSchoolClass) => void;
}

const ClassSelectionList = ({
  row,
  selectedClasses,
  setSelectedClasses,
  activeSchool,
  floatingBar,
  onPdfClick,
  onCsvClick,
}: ClassSelectionListProps) => {
  const { t } = useTranslation();
  const selectedSchool = useSchoolStore((s) => s.selectedSchool);
  const { isSuperAdmin } = useLdapGroups();

  const handlePdfClick = (event: React.MouseEvent, group: LmnApiSchoolClass) => {
    event.stopPropagation();
    onPdfClick(group);
  };

  const handleCsvClick = (event: React.MouseEvent, group: LmnApiSchoolClass) => {
    event.stopPropagation();
    onCsvClick(group);
  };

  return (
    <div className="flex flex-row flex-wrap">
      {row.groups.length ? (
        row.groups
          .filter((group) => !isSuperAdmin || (group as LmnApiSchoolClass).sophomorixSchoolname === selectedSchool)
          .map((group) => (
            <ClassSelectionCard
              key={(group as LmnApiSchoolClass).dn}
              group={group as LmnApiSchoolClass}
              selectedClasses={selectedClasses}
              setSelectedClasses={setSelectedClasses}
              disabled={!!activeSchool && (group as LmnApiSchoolClass).sophomorixSchoolname !== activeSchool}
              onPdfClick={handlePdfClick}
              onCsvClick={handleCsvClick}
            />
          ))
      ) : (
        <div className="mt-3">{t('classmanagement.notMemberOfClass')}</div>
      )}

      {floatingBar}
    </div>
  );
};

export default ClassSelectionList;
