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

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DropdownSelect } from '@/components';
import { type DropdownOptions } from '@/components/ui/DropdownSelect/DropdownSelect';
import useClassManagementStore from '../useClassManagementStore';

const SchoolSelectorDropdown: React.FC = () => {
  const { t } = useTranslation();
  const { selectedSchool, setSelectedSchool, schools, getSchools } = useClassManagementStore();

  useEffect(() => {
    void getSchools();
  }, []);

  const schoolOptions: DropdownOptions[] = schools.map((item) => ({
    id: item.ou,
    name: item.displayName || item.ou,
  }));

  useEffect(() => {
    if (schools.length > 0 && !selectedSchool) {
      setSelectedSchool(schools[0].ou);
    }
  }, [schools]);

  return (
    <DropdownSelect
      placeholder={t('classmanagement.selectSchool.placeholder')}
      options={schoolOptions}
      selectedVal={selectedSchool}
      handleChange={setSelectedSchool}
      translate={false}
      searchEnabled={false}
    />
  );
};

export default SchoolSelectorDropdown;
