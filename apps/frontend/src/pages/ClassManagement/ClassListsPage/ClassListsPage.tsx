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

import React, { useEffect, useState } from 'react';
import useLmnApiStore from '@/store/useLmnApiStore';
import { useTranslation } from 'react-i18next';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import GroupColumn from '@libs/groups/types/groupColumn';
import UserGroups from '@libs/groups/types/userGroups.enum';
import getUserRegex from '@libs/lmnApi/constants/userRegex';
import { Input } from '@edulution-io/ui-kit';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import PageLayout from '@/components/structure/layout/PageLayout';
import useLdapGroups from '@/hooks/useLdapGroups';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import type FileExportFormat from '@libs/classManagement/types/fileExportFormat';
import { FILE_EXPORT_FORMAT } from '@libs/classManagement/types/fileExportFormat';
import ClassSelectionList from '@/pages/ClassManagement/components/ClassList/ClassSelectionList';
import SchoolSelectorDropdown from '@/components/shared/SchoolSelectorDropdown';
import ClassListsFloatingButtonsBar from './ClassListsFloatingButtonsBar';
import ClassListsDialog from './ClassListsDialog';

const ClassListsPage: React.FC = () => {
  const { t } = useTranslation();
  const { getOwnUser, user, lmnApiToken } = useLmnApiStore();
  const { userSchoolClasses, fetchUserSchoolClasses } = useClassManagementStore();
  const [filterKeyWord, setFilterKeyWord] = useState<string>('');
  const [selectedClasses, setSelectedClasses] = useState<LmnApiSchoolClass[]>([]);
  const { isSuperAdmin } = useLdapGroups();
  const [isLoading, setIsLoading] = useState(false);
  const [classToDownload, setClassToDownload] = useState<LmnApiSchoolClass | null>(null);
  const [formatToDownload, setFormatToDownload] = useState<FileExportFormat | null>(null);

  useEffect(() => {
    if (!lmnApiToken) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        await getOwnUser();
        await fetchUserSchoolClasses();
      } finally {
        setIsLoading(false);
      }
    };

    void fetchData();
  }, [lmnApiToken, getOwnUser, fetchUserSchoolClasses]);

  const userRegex = getUserRegex(user?.cn || '');

  const filterSchoolClasses = (schoolClass: LmnApiSchoolClass) =>
    schoolClass.member?.find((member) => (isSuperAdmin ? true : userRegex.test(member))) &&
    (schoolClass.cn.includes(filterKeyWord) || schoolClass.displayName.includes(filterKeyWord));

  const groupRows: Omit<GroupColumn, 'icon'>[] = [
    {
      name: UserGroups.Classes,
      translationId: 'myClasses',
      groups: userSchoolClasses.filter(filterSchoolClasses),
    },
  ];

  const activeSchool = selectedClasses.length > 0 ? selectedClasses[0].sophomorixSchoolname : null;

  const handlePdfClick = (group: LmnApiSchoolClass) => {
    setFormatToDownload(FILE_EXPORT_FORMAT.PDF);
    setClassToDownload(group);
  };

  const handleCsvClick = (group: LmnApiSchoolClass) => {
    setFormatToDownload(FILE_EXPORT_FORMAT.CSV);
    setClassToDownload(group);
  };

  return (
    <PageLayout>
      <div className="mb-2 flex w-full flex-col gap-2 pt-1 md:flex-row md:items-center md:gap-4">
        <div className="min-w-0 flex-1">
          <Input
            className="h-10 w-full"
            name="filter"
            onChange={(e) => setFilterKeyWord(e.target.value)}
            placeholder={t('classmanagement.typeToFilter')}
          />
        </div>

        {isSuperAdmin && <SchoolSelectorDropdown />}
      </div>

      <div className="flex max-h-full max-w-full flex-row flex-wrap overflow-y-auto text-foreground scrollbar-thin">
        <p className="mt-2 min-w-full">{t('classmanagement.classListsPageDescription')}</p>
        {groupRows.map((row) => (
          <div
            key={row.name}
            className="mt-4 min-w-full"
          >
            <h3>{t('classmanagement.classLists')}</h3>
            <ClassSelectionList
              row={row}
              selectedClasses={selectedClasses}
              setSelectedClasses={setSelectedClasses}
              activeSchool={activeSchool}
              floatingBar={<ClassListsFloatingButtonsBar selectedClasses={selectedClasses} />}
              onPdfClick={handlePdfClick}
              onCsvClick={handleCsvClick}
            />
          </div>
        ))}
      </div>

      {classToDownload && formatToDownload && (
        <ClassListsDialog
          title={formatToDownload}
          selectedClasses={[classToDownload]}
          onClose={() => {
            setClassToDownload(null);
            setFormatToDownload(null);
          }}
        />
      )}

      <LoadingIndicatorDialog isOpen={isLoading} />
    </PageLayout>
  );
};

export default ClassListsPage;
