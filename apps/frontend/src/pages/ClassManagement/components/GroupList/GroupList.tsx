import React from 'react';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import GroupDialog from '@/pages/ClassManagement/components/GroupDialog/GroupDialog';
import GroupColumn from '@libs/groups/types/groupColumn';
import GroupListCard from '@/pages/ClassManagement/components/GroupList/GroupListCard';
import { useTranslation } from 'react-i18next';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';

interface GroupListProps {
  row: GroupColumn;
  isEnrolEnabled?: boolean;
}

const GroupList = ({ row, isEnrolEnabled }: GroupListProps) => {
  const { t } = useTranslation();
  const { openDialogType } = useLessonStore();

  return (
    <div className="flex flex-row flex-wrap">
      {row.groups.length ? (
        row.groups.map((group) => (
          <GroupListCard
            key={row.name + (group as LmnApiProject | LmnApiSchoolClass).dn}
            group={group as LmnApiProject | LmnApiSchoolClass}
            type={row.name}
            icon={row.icon}
            isEnrolEnabled={isEnrolEnabled}
          />
        ))
      ) : (
        <div className="mt-3">{t('classmanagement.noGroupsToShow')}</div>
      )}
      {openDialogType === row.name && <GroupDialog item={row} />}
    </div>
  );
};

export default GroupList;
