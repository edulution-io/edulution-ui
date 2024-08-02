import React from 'react';
import { useTranslation } from 'react-i18next';
import GroupCard from '@/pages/ClassManagement/LessonPage/QuickAccess/GroupCard';
import GroupColumn from '@libs/groups/types/groupColumn';
import GroupDialog from '@/pages/ClassManagement/components/GroupDialog/GroupDialog';
import useUserStore from '@/store/UserStore/UserStore';
import CircleLoader from '@/components/ui/CircleLoader';

interface GroupsColumnProps {
  column: GroupColumn;
}

const GroupsColumn = ({ column }: GroupsColumnProps) => {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const { name, translationId, icon, groups, isLoading } = column;
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  if (!groups || !Array.isArray(groups)) {
    return null;
  }

  const groupCards = groups.map((group) => (
    <GroupCard
      type={name}
      key={user!.username + group.name}
      group={group}
      icon={icon}
      setIsDialogOpen={setIsDialogOpen}
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
      {isDialogOpen && <GroupDialog item={column} />}
    </>
  );
};

export default GroupsColumn;
