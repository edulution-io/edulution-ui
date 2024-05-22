import React from 'react';
import ReactPlayer from 'react-player';
import QuotaBar from '@/pages/SchoolmanagementPage/components/profiles/QuotaBar';
import { FaUserPlus } from 'react-icons/fa';
import { Button } from '@/components/shared/Button';
import StudentsPermissionBar from './StudentsPermissionBar';
import linuxRec from 'apps/frontend/src/pages/SchoolmanagementPage/mockVyron/linuxRec.mp4';
interface ProfileCardProps {
  id?: string;
  name?: string;
  username?: string;
  isAddCard?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  vidoUrl?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ name, username, vidoUrl, isAddCard, isSelected, onSelect }) => {
  return (
    <div
      className={`w-80 overflow-hidden rounded-lg border ${isSelected ? 'border-blue-500' : 'border-gray-300'} cursor-pointer p-4 font-sans shadow-lg`}
      onClick={onSelect}
    >
      {isAddCard ? (
        <div className="flex h-full w-full items-center justify-center text-blue-500">
          <Button
            type="button"
            className="space-x-4 bg-opacity-90 p-4"
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
              >
                <ReactPlayer
                  url={vidoUrl || linuxRec}
                  config={{
                    file: {
                      forceVideo: true,
                    },
                  }}
                  playing
                  loop={true}
                  className="absolute left-0 top-0 h-full w-full"
                  width="100%"
                  height="100%"
                />
              </div>
            </div>
            <div className="flex flex-row">
              <div className="ml-4 flex flex-col justify-center">
                <QuotaBar />
              </div>
            </div>
          </div>
          <StudentsPermissionBar />
        </>
      )}
    </div>
  );
};

export default ProfileCard;
