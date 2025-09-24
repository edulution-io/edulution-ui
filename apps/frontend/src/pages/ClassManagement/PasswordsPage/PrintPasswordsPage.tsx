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
      <Input
        name="filter"
        onChange={(e) => setFilterKeyWord(e.target.value)}
        placeholder={t('classmanagement.typeToFilter')}
        className="mb-2"
      />
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
