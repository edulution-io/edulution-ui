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
import GroupList from '@/pages/ClassManagement/components/GroupList/GroupList';
import GroupColumn from '@libs/groups/types/groupColumn';
import UserGroups from '@libs/groups/types/userGroups.enum';
import { MdGroups } from 'react-icons/md';
import { FaPrint, FaUsersGear } from 'react-icons/fa6';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import Input from '@/components/shared/Input';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiPrinter from '@libs/lmnApi/types/lmnApiPrinter';
import PageLayout from '@/components/structure/layout/PageLayout';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import useLdapGroups from '@/hooks/useLdapGroups';
import SchoolSelectorDropdown from '../components/SchoolSelectorDropdown';

const EnrolPage: React.FC = () => {
  const { t } = useTranslation();
  const { getOwnUser, lmnApiToken } = useLmnApiStore();
  const {
    userProjects,
    userSchoolClasses,
    fetchUserProjects,
    fetchUserSchoolClasses,
    isLoading,
    printers,
    fetchPrinters,
  } = useClassManagementStore();
  const [filterKeyWord, setFilterKeyWord] = useState<string>('');
  const { isSuperAdmin } = useLdapGroups();

  useEffect(() => {
    if (lmnApiToken) {
      void getOwnUser();
      void fetchUserProjects();
      void fetchPrinters();
      void fetchUserSchoolClasses();
    }
  }, [lmnApiToken]);

  const filterGroups = (group: LmnApiProject | LmnApiSchoolClass | LmnApiPrinter) =>
    group.cn.includes(filterKeyWord) || group.displayName.includes(filterKeyWord);

  const groupRows: GroupColumn[] = [
    {
      name: UserGroups.Classes,
      translationId: 'myClasses',
      icon: <MdGroups className="h-7 w-7" />,
      groups: userSchoolClasses?.filter(filterGroups),
    },
    {
      name: UserGroups.Printers,
      translationId: 'printers',
      icon: <FaPrint className="h-5 w-7" />,
      groups: Array.isArray(printers) ? printers.filter(filterGroups) : [],
    },
    {
      name: UserGroups.Projects,
      translationId: 'myProjects',
      icon: <FaUsersGear className="h-5 w-7" />,
      groups: userProjects?.filter(filterGroups),
    },
  ];

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
        <p className="mt-2 min-w-full">{t('classmanagement.enrolPageDescription')}</p>
        {groupRows.map((row) => (
          <div
            key={row.name}
            className="mt-4 min-w-full"
          >
            <AccordionSH
              type="multiple"
              defaultValue={[row.name]}
            >
              <AccordionItem value={row.name}>
                <AccordionTrigger>
                  <h3>{t(`classmanagement.${row.name}`)}</h3>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 px-1">
                  <GroupList
                    row={row}
                    isEnrolEnabled
                  />
                </AccordionContent>
              </AccordionItem>
            </AccordionSH>
          </div>
        ))}
      </div>
      <LoadingIndicatorDialog isOpen={isLoading} />
    </PageLayout>
  );
};

export default EnrolPage;
