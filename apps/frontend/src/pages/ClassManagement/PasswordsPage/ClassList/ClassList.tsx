import React, { useState } from 'react';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import GroupColumn from '@libs/groups/types/groupColumn';
import PasswordsFloatingButtonsBar from '@/pages/ClassManagement/PasswordsPage/PasswordsFloatingButtonsBar';
import ClassListCard from '@/pages/ClassManagement/PasswordsPage/ClassList/ClassListCard';

interface EnrolGroupListProps {
  row: GroupColumn;
}

const ClassList = ({ row }: EnrolGroupListProps) => {
  const [selectedClasses, setSelectedClasses] = useState<LmnApiSchoolClass[]>([]);

  return (
    <div className="flex flex-row flex-wrap">
      {row.groups.map((group) => (
        <ClassListCard
          key={(group as LmnApiSchoolClass).dn}
          group={group as LmnApiSchoolClass}
          selectedClasses={selectedClasses}
          setSelectedClasses={setSelectedClasses}
        />
      ))}

      <PasswordsFloatingButtonsBar selectedClasses={selectedClasses} />
    </div>
  );
};

export default ClassList;
