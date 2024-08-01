import React from 'react';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import GroupDialog from '@/pages/ClassManagement/components/GroupDialog/GroupDialog';
import GroupColumn from '@libs/groups/types/groupColumn';
import GroupListCard from '@/pages/ClassManagement/components/GroupList/GroupListCard';
import CreateGroupButton from '@/pages/ClassManagement/components/CreateGroupButton';
import { useTranslation } from 'react-i18next';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';

interface GroupListProps {
  row: GroupColumn;
  isEnrolEnabled?: boolean;
}

const GroupList = ({ row, isEnrolEnabled }: GroupListProps) => {
  const { setOpenDialogType } = useLessonStore();
  const { t } = useTranslation();

  return (
    <div className="flex flex-row flex-wrap">
      {row.groups.map((group) => (
        <GroupListCard
          key={(group as LmnApiProject | LmnApiSchoolClass).dn}
          group={group as LmnApiProject | LmnApiSchoolClass}
          type={row.name}
          icon={row.icon}
          isEnrolEnabled={isEnrolEnabled}
        />
      ))}
      {isEnrolEnabled ? null : (
        <CreateGroupButton
          title={t(`classmanagement.create${row.translationId}`)}
          handleButtonClick={() => setOpenDialogType(row.name)}
        />
      )}
      <GroupDialog item={row} />
    </div>
  );
};

export default GroupList;
