import React from 'react';
import { useTranslation } from 'react-i18next';
import GroupCard from '@/pages/ClassManagement/LessonPage/QuickAccess/GroupCard';
import GroupColumn from '@libs/groups/types/groupColumn';
import useUserStore from '@/store/UserStore/UserStore';
import CircleLoader from '@/components/ui/CircleLoader';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';

interface GroupsColumnProps {
  column: GroupColumn;
}

const GroupsColumn = ({ column }: GroupsColumnProps) => {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const { name, translationId, icon, groups, isLoading } = column;

  if (!groups || !Array.isArray(groups)) {
    return null;
  }

  const groupCards = groups.map((group) => (
    <GroupCard
      type={name}
      key={user!.username + group.name}
      group={group as LmnApiSession | LmnApiProject | LmnApiSchoolClass}
      icon={icon}
    />
  ));

  const getContent = () => {
    if (groupCards.length) {
      return groupCards;
    }
    if (isLoading) {
      return <CircleLoader />;
    }
    return <p>{t('classmanagement.noneAvailable')}</p>;
  };

  return (
    <>
      <p className="mb-4 text-center text-2xl">{t(`classmanagement.${translationId}`)}</p>
      <div className="flex flex-wrap justify-center gap-4">{getContent()}</div>
      <div className="mt-1 flex justify-center" />
    </>
  );
};

export default GroupsColumn;
