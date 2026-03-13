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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPrint, faUsers, faUsersGear } from '@fortawesome/free-solid-svg-icons';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import { Input } from '@edulution-io/ui-kit';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiPrinter from '@libs/lmnApi/types/lmnApiPrinter';
import PageLayout from '@/components/structure/layout/PageLayout';
import { SectionAccordion, SectionAccordionItem } from '@/components/ui/SectionAccordion';
import useLdapGroups from '@/hooks/useLdapGroups';
import SchoolSelectorDropdown from '@/components/shared/SchoolSelectorDropdown';

const EnrolPage: React.FC = () => {
  const { t } = useTranslation();
  const { getOwnUser, lmnApiToken } = useLmnApiStore();
  const {
    userProjects,
    userSchoolClasses,
    fetchUserProjects,
    fetchUserSchoolClasses,
    updateSchoolClass,
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
      updateFunction: updateSchoolClass,
      icon: (
        <FontAwesomeIcon
          icon={faUsers}
          className="h-7 w-7"
        />
      ),
      groups: userSchoolClasses?.filter(filterGroups),
    },
    {
      name: UserGroups.Printers,
      translationId: 'printers',
      icon: (
        <FontAwesomeIcon
          icon={faPrint}
          className="h-5 w-7"
        />
      ),
      groups: Array.isArray(printers) ? printers.filter(filterGroups) : [],
    },
    {
      name: UserGroups.Projects,
      translationId: 'myProjects',
      icon: (
        <FontAwesomeIcon
          icon={faUsersGear}
          className="h-7 w-7"
        />
      ),
      groups: userProjects?.filter(filterGroups),
    },
  ];

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
      <div className="flex max-h-full max-w-full flex-row flex-wrap overflow-y-auto scrollbar-thin">
        <p className="mt-2 min-w-full text-foreground">{t('classmanagement.enrolPageDescription')}</p>
        <div className="mt-4 min-w-full">
          <SectionAccordion defaultOpenAll>
            {groupRows.map((row) => (
              <SectionAccordionItem
                key={row.name}
                id={row.name}
                label={t(`classmanagement.${row.name}`)}
                variant="transparent"
              >
                <GroupList
                  row={row}
                  isEnrolEnabled
                />
              </SectionAccordionItem>
            ))}
          </SectionAccordion>
        </div>
      </div>
      <LoadingIndicatorDialog isOpen={isLoading} />
    </PageLayout>
  );
};

export default EnrolPage;
