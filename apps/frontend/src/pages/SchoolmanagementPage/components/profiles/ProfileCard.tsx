import React from 'react';
import ReactPlayer from 'react-player';
import QuotaBar from '@/pages/SchoolmanagementPage/components/profiles/QuotaBar';
import { FaUserPlus } from 'react-icons/fa';
import { Button } from '@/components/shared/Button';
import linuxRec from 'apps/frontend/src/pages/SchoolmanagementPage/mockVyron/linuxRec.mp4';
import StudentsPermissionBar from './StudentsPermissionBar';
import useSchoolmanagementComponentStore from '@/pages/SchoolmanagementPage/store/schoolManagementComponentStore.ts';

interface ProfileCardProps {
  id?: string;
  name?: string;
  username?: string;
  isAddCard?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  videoUrl?: string;
  memberId?: string;
  setStudentsDialogOpen?: (isOpen: boolean) => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  username,
  videoUrl,
  isAddCard,
  isSelected,
  onSelect,
  setStudentsDialogOpen,
  memberId,
}) => {
  const { setIsVideoModalOpen, setVideoModalUsername, setVideoModalUrl } = useSchoolmanagementComponentStore();
  return (
    <div
      className={`w-80 overflow-hidden rounded-xl border ${isSelected ? 'border-blue-500' : 'border-gray-300'} cursor-pointer p-4 font-sans shadow-lg`}
      onClick={onSelect}
    >
      {isAddCard ? (
        <div className="flex h-full w-full items-center justify-center text-blue-500">
          <Button
            type="button"
            className="space-x-4 bg-opacity-90 p-4"
            onClick={() => setStudentsDialogOpen && setStudentsDialogOpen(true)}
          >
            <FaUserPlus className="h-12 w-12" />
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-row gap-2">
            <p className="font-bold text-white">{name}</p>
          </div>
          <p className="text-sm text-gray-500">{username}</p>
          <div className="flex">
            <div className="flex w-1/2 items-center justify-center bg-transparent">
              <div
                className="relative w-full"
                style={{ paddingBottom: '56.25%' }}
                role="button"
                onClick={(e) => {
                  setVideoModalUrl(videoUrl || linuxRec);
                  setVideoModalUsername(name || '');
                  setIsVideoModalOpen(true);
                  e.stopPropagation();
                }}
              >
                <ReactPlayer
                  url={videoUrl || linuxRec}
                  config={{
                    file: {
                      forceVideo: true,
                    },
                  }}
                  playing
                  loop
                  className="absolute left-0 top-0 h-full w-full"
                  width="100%"
                  height="100%"
                />
              </div>
            </div>
            <div className="flex flex-row">
              <div className="ml-4 flex flex-col justify-center">
                <QuotaBar username={username} />
              </div>
            </div>
          </div>
          <StudentsPermissionBar memberId={memberId || ''} />
        </>
      )}
    </div>
  );
};

export default ProfileCard;
