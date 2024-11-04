import React from 'react';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import GroupColumn from '@libs/groups/types/groupColumn';
import PasswordsFloatingButtonsBar from '@/pages/ClassManagement/PasswordsPage/PasswordsFloatingButtonsBar';
import ClassListCard from '@/pages/ClassManagement/PasswordsPage/ClassList/ClassListCard';
import { useTranslation } from 'react-i18next';

interface EnrolGroupListProps {
  row: GroupColumn;
  selectedClasses: LmnApiSchoolClass[];
  setSelectedClasses: React.Dispatch<React.SetStateAction<LmnApiSchoolClass[]>>;
}

const ClassList = ({ row, selectedClasses, setSelectedClasses }: EnrolGroupListProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-row flex-wrap">
      {row.groups.length ? (
        row.groups.map((group) => (
          <ClassListCard
            key={(group as LmnApiSchoolClass).dn}
            group={group as LmnApiSchoolClass}
            selectedClasses={selectedClasses}
            setSelectedClasses={setSelectedClasses}
          />
        ))
      ) : (
        <div className="mt-3">{t('classmanagement.notMemberOfClass')}</div>
      )}

      <PasswordsFloatingButtonsBar selectedClasses={selectedClasses} />
    </div>
  );
};

export default ClassList;
