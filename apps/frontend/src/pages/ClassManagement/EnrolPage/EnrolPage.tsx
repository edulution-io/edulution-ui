/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import Input from '@/components/shared/Input';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiPrinter from '@libs/lmnApi/types/lmnApiPrinter';
import { FILTER_BAR_ID } from '@libs/classManagement/constants/pageElementIds';
import useElementHeight from '@/hooks/useElementHeight';
import { FOOTER_ID } from '@libs/common/constants/pageElementIds';

const EnrolPage: React.FC = () => {
  const { t } = useTranslation();
  const { getOwnUser, user } = useLmnApiStore();
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

  useEffect(() => {
    void getOwnUser();
    void fetchUserProjects();
    void fetchPrinters();
    void fetchUserSchoolClasses();
  }, []);

  if (!user) {
    return null;
  }

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

  const pageBarsHeight = useElementHeight([FILTER_BAR_ID, FOOTER_ID]) + 10;

  return (
    <div className="mt-2">
      <Input
        name="filter"
        onChange={(e) => setFilterKeyWord(e.target.value)}
        placeholder={t('classmanagement.typeToFilter')}
        id={FILTER_BAR_ID}
        className="mb-2"
      />
      <div
        className="flex max-w-full flex-row flex-wrap overflow-y-auto overflow-x-visible scrollbar-thin"
        style={{ maxHeight: `calc(100vh - ${pageBarsHeight}px)` }}
      >
        <div className="mt-2 min-w-full text-lg text-background">{t('classmanagement.enrolPageDescription')}</div>
        {groupRows.map((row) => (
          <div
            key={row.name}
            className="mt-4 min-w-full text-background"
          >
            <h4 className="text-background">{t(`classmanagement.${row.name}`)}</h4>
            <GroupList
              row={row}
              isEnrolEnabled
            />
          </div>
        ))}
      </div>
      <LoadingIndicator isOpen={isLoading} />
    </div>
  );
};

export default EnrolPage;
