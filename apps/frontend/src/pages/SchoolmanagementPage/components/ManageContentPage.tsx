import React, { useEffect, useState } from 'react';
import useSchoolManagementStore from '@/pages/SchoolmanagementPage/store/schoolManagementStore';
import { MemberInfo } from '@/datatypes/schoolclassInfo';
import { FaArrowLeft } from 'react-icons/fa';
import ProfileCard from '@/pages/SchoolmanagementPage/components/profiles/ProfileCard';
import { ScrollArea } from '@/components/ui/ScrollArea';
import FloatingButtonsBarClassManagement from '@/pages/SchoolmanagementPage/components/FloatingButtonsBarClassManagement';
import userStore from '@/store/userStore';
import { SessionInfoState } from '@/datatypes/sessionInfo';
import linuxRec from 'apps/frontend/src/pages/SchoolmanagementPage/mockVyron/linuxRec.mp4';
import windowsRec from 'apps/frontend/src/pages/SchoolmanagementPage/mockVyron/windowsRec.mp4';
interface ManageContentPageProps {
  contentKey: string;
  contentType: 'class' | 'session' | 'project';
}

const ManageContentPage: React.FC<ManageContentPageProps> = ({ contentKey, contentType }) => {
  const { schoolclasses, availableSessions } = useSchoolManagementStore();
  const { userInfo } = userStore();
  const [currentMembers, setCurrentMembers] = useState<MemberInfo[]>([]);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);

  useEffect(() => {
    let fullKey: string | undefined;
    let members: MemberInfo[] = [];

    if (contentType === 'class') {
      fullKey =
        Object.keys(schoolclasses).find((key) => key.endsWith(`/${contentKey}`)) ||
        Object.keys(schoolclasses).find((key) => key.includes(contentKey));
      if (fullKey) members = schoolclasses[fullKey];
    } else if (contentType === 'session') {
      const sessions = availableSessions.find((session: SessionInfoState) => session.name === contentKey);
      if (sessions) {
        members = sessions.members.map(
          (id) =>
            ({
              id,
              firstName: id,
              lastName: '',
            }) as MemberInfo,
        );
      }
    } else if (contentType === 'project') {
      // const project = userInfo.ldapGroups.projects.find((project) => project === contentKey);
      // if (project) members = userInfo;
    }

    setCurrentMembers(members || []);
  }, [contentKey, contentType, schoolclasses, availableSessions, userInfo]);

  const removeContentParamAndNavigate = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete(contentType);
    window.location.href = url.toString();
  };

  const handleSelectProfile = (id: string) => {
    setSelectedProfiles((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((profileId) => profileId !== id) : [...prevSelected, id],
    );
  };

  if (!currentMembers.length) {
    return (
      <div>
        No Data for {contentType} {contentKey}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-row items-center p-4">
        <FaArrowLeft
          onClick={removeContentParamAndNavigate}
          className="cursor-pointer"
          size={24}
        />
        <h2 className="ml-2">{contentKey}</h2>
      </div>
      <div className="flex-1 overflow-hidden p-4">
        <ScrollArea className="h-full w-full overflow-auto">
          <div className="flex flex-wrap gap-4">
            {currentMembers.map((member, count) => (
              <ProfileCard
                key={member.id}
                id={member.id}
                name={`${member.firstName} ${member.lastName}`}
                username={member.firstName}
                isAddCard={false}
                isSelected={selectedProfiles.includes(member.id)}
                onSelect={() => handleSelectProfile(member.id)}
                vidoUrl={count % 2 === 0 ? linuxRec : windowsRec}
              />
            ))}
            <ProfileCard isAddCard />
          </div>
        </ScrollArea>
      </div>
      <FloatingButtonsBarClassManagement />
    </div>
  );
};

export default ManageContentPage;
