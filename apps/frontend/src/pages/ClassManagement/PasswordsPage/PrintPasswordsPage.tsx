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
import { MdGroups } from 'react-icons/md';
import ClassList from '@/pages/ClassManagement/PasswordsPage/ClassList/ClassList';
import getUserRegex from '@libs/lmnApi/constants/userRegex';
import Input from '@/components/shared/Input';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import PageLayout from '@/components/structure/layout/PageLayout';
import useLdapGroups from '@/hooks/useLdapGroups';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import SchoolSelectorDropdown from '../components/SchoolSelectorDropdown';

const PrintPasswordsPage: React.FC = () => {
  const { t } = useTranslation();
  const { getOwnUser, user, lmnApiToken } = useLmnApiStore();
  const { userSchoolClasses, fetchUserSchoolClasses } = useClassManagementStore();
  const [filterKeyWord, setFilterKeyWord] = useState<string>('');
  const [selectedClasses, setSelectedClasses] = useState<LmnApiSchoolClass[]>([]);
  const { isSuperAdmin } = useLdapGroups();
  const [isLoading, setIsLoading] = useState(false);

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

  const groupRows: GroupColumn[] = [
    {
      name: UserGroups.Classes,
      translationId: 'myClasses',
      icon: <MdGroups className="h-7 w-7" />,
      groups: userSchoolClasses.filter(filterSchoolClasses),
    },
  ];

  const activeSchool = selectedClasses.length > 0 ? selectedClasses[0].sophomorixSchoolname : null;

  return (
    <PageLayout>
      <div className="mb-2 flex w-full flex-col gap-2 md:flex-row md:items-center md:gap-4">
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

      <div className="flex max-h-full max-w-full flex-row flex-wrap overflow-y-auto scrollbar-thin">
        <p className="mt-2 min-w-full">{t('classmanagement.printPasswordsPageDescription')}</p>
        {groupRows.map((row) => (
          <div
            key={row.name}
            className="mt-4 min-w-full"
          >
            <h4 className="text-background">{t(`classmanagement.printPasswords`)}</h4>
            <ClassList
              row={row}
              selectedClasses={selectedClasses}
              setSelectedClasses={setSelectedClasses}
              activeSchool={activeSchool}
            />
          </div>
        ))}
      </div>
      <LoadingIndicatorDialog isOpen={isLoading} />
    </PageLayout>
  );
};

export default PrintPasswordsPage;
