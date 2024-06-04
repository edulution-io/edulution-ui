import React, { useEffect, useState } from 'react';
import useSchoolManagementStore from '@/pages/SchoolmanagementPage/store/schoolManagementStore';
import { MemberInfo } from '@/datatypes/schoolclassInfo';
import { FaArrowLeft } from 'react-icons/fa';
import ProfileCard from '@/pages/SchoolmanagementPage/components/profiles/ProfileCard';
import { ScrollArea } from '@/components/ui/ScrollArea';
import FloatingButtonsBarClassManagement from '@/pages/SchoolmanagementPage/components/FloatingButtonsBarClassManagement';
import { SessionInfoState } from '@/datatypes/sessionInfo';
import linuxRec from 'apps/frontend/src/pages/SchoolmanagementPage/mockVyron/linuxRec.mp4';
import windowsRec from 'apps/frontend/src/pages/SchoolmanagementPage/mockVyron/windowsRec.mp4';
import ComputerMonitoringDialog from '@/pages/SchoolmanagementPage/components/dialogs/ComputerMonitoringDialog.tsx';
import useSchoolManagementComponentStore from '@/pages/SchoolmanagementPage/store/schoolManagementComponentStore.ts';
import AddStudentsDialog from '@/pages/SchoolmanagementPage/components/dialogs/AddStudentsDialog.tsx';
import { t } from 'i18next';
import StartExamModeDialog from '@/pages/SchoolmanagementPage/components/dialogs/StartExamModeDialog.tsx';
import SetPermissionsToStudentsDialog from '@/pages/SchoolmanagementPage/components/dialogs/SetPermissionsToStudentsDialog.tsx';
import CollectFilesDialog from '@/pages/SchoolmanagementPage/components/dialogs/CollectFilesDialog.tsx';
import ShareFilesDialog from '@/pages/SchoolmanagementPage/components/dialogs/ShareFilesDialog.tsx';
import ShowCollectedFilesDialog from '@/pages/SchoolmanagementPage/components/dialogs/ShowCollectedFilesDialog.tsx';
import { useNavigate } from 'react-router-dom';

interface ManageContentPageProps {
  contentKey: string;
  contentType: 'class' | 'session' | 'project';
}

const ManageContentPage: React.FC<ManageContentPageProps> = ({ contentKey, contentType }) => {
  const { schoolclasses, projects, availableSessions } = useSchoolManagementStore();
  const { setMembersOfOpenGroup, membersOfOpenGroup, setPermissionsForUser, setPermissionsForAllUsers } =
    useSchoolManagementComponentStore();
  const [selectedProfiles, setSelectedProfiles] = useState<MemberInfo[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isVideoModalOpen, videoModalUrl, videoModalUsername, setIsVideoModalOpen, resetVideoModal } =
    useSchoolManagementComponentStore();

  const [shareState, setShareState] = useState(false);
  const [collectState, setCollectState] = useState(false);
  const [showFilesState, setShowFilesState] = useState(false);
  const [examState, setExamState] = useState(false);
  const [showWifiState, setShowWifiState] = useState(false);
  const [showInternetState, setShowInternetState] = useState(false);
  const [showPrinterState, setShowPrinterState] = useState(false);

  const navigate = useNavigate();

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
      fullKey =
        Object.keys(projects).find((key) => key.endsWith(`/${contentKey}`)) ||
        Object.keys(projects).find((key) => key.includes(contentKey));
      if (fullKey) members = projects[fullKey];
    }

    setMembersOfOpenGroup(members || []);
  }, [contentKey, contentType, schoolclasses, projects, availableSessions, setMembersOfOpenGroup]);

  const removeContentParamAndNavigate = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete(contentType);
    navigate(url);
  };

  const handleSelectProfile = (member: MemberInfo) => {
    setSelectedProfiles((prevSelected) =>
      prevSelected.includes(member)
        ? prevSelected.filter((selectedMember) => selectedMember.id !== member.id)
        : [...prevSelected, member],
    );
  };

  const handleSetPermissionsForSelectedUsers = (permissions: Partial<MemberInfo>) => {
    selectedProfiles.forEach((member) => setPermissionsForUser(member.id, permissions));
    setSelectedProfiles([]);
  };

  const handleSetPermissionsForAllUsers = (permissions: Partial<MemberInfo>) => {
    setPermissionsForAllUsers(permissions);
    setSelectedProfiles([]);
  };

  if (!membersOfOpenGroup.length) {
    return (
      <div>
        <div className="flex flex-row items-center p-4">
          <FaArrowLeft
            onClick={removeContentParamAndNavigate}
            className="cursor-pointer"
            size={24}
          />
          <h3 className="ml-2">{t('schoolManagement.noUsersInGroup', { name: contentKey })}</h3>
        </div>
        <ProfileCard
          isAddCard
          onSelect={() => setIsDialogOpen(true)}
        />
        <AddStudentsDialog
          isOpen={isDialogOpen}
          schoolClass={contentKey}
          handleOpenChange={setIsDialogOpen}
        />
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
        <ScrollArea className="max-h-[70vh] w-full overflow-auto">
          <div className="flex flex-wrap gap-4">
            <ComputerMonitoringDialog
              isOpen={isVideoModalOpen}
              setIsOpen={() => setIsVideoModalOpen(false)}
              username={videoModalUsername}
              videoUrl={videoModalUrl}
              onOpenChange={(isOpen) => {
                if (!isOpen) {
                  resetVideoModal();
                }
              }}
            />

            <AddStudentsDialog
              isOpen={isDialogOpen}
              schoolClass={contentKey}
              handleOpenChange={setIsDialogOpen}
            />
            {membersOfOpenGroup.map((member, count) => (
              <ProfileCard
                key={member.email}
                id={member.id}
                memberId={member.id}
                name={`${member.firstName} ${member.lastName}`}
                username={member.username}
                isAddCard={false}
                isSelected={selectedProfiles.includes(member)}
                onSelect={() => handleSelectProfile(member)}
                videoUrl={count % 2 === 0 ? linuxRec : windowsRec}
              />
            ))}
            <ProfileCard
              isAddCard
              onSelect={() => setIsDialogOpen(true)}
            />
          </div>
        </ScrollArea>
      </div>
      <FloatingButtonsBarClassManagement
        setShareState={() => setShareState(!shareState)}
        setCollectState={() => setCollectState(!collectState)}
        setShowFilesState={() => setShowFilesState(!showFilesState)}
        setExamState={() => setExamState(!examState)}
        setWifiState={() => setShowWifiState(!showWifiState)}
        setInternetState={() => setShowInternetState(!showInternetState)}
        setPrinterState={() => setShowPrinterState(!showPrinterState)}
      />
      <StartExamModeDialog
        open={examState}
        onClose={() => setExamState(false)}
        onConfirm={() => setExamState(false)}
      />

      <SetPermissionsToStudentsDialog
        open={showWifiState}
        onClose={() => {
          setShowWifiState(false);
          selectedProfiles.length > 0
            ? handleSetPermissionsForSelectedUsers({ isWifiOn: false })
            : handleSetPermissionsForAllUsers({ isWifiOn: false });
        }}
        onConfirm={() => {
          setShowWifiState(false);
          selectedProfiles.length > 0
            ? handleSetPermissionsForSelectedUsers({ isWifiOn: true })
            : handleSetPermissionsForAllUsers({ isWifiOn: true });
        }}
        title={t('schoolManagement.wifiSettings')}
        message={
          selectedProfiles.length > 0
            ? t('schoolManagement.wifiSettingsSelectedUserMessage')
            : t('schoolManagement.wifiSettingsMessage')
        }
        confirmText={t('schoolManagement.turnOn')}
        members={selectedProfiles}
      />
      <SetPermissionsToStudentsDialog
        open={showInternetState}
        onClose={() => {
          setShowInternetState(false);
          selectedProfiles.length > 0
            ? handleSetPermissionsForSelectedUsers({ isInternetOn: false })
            : handleSetPermissionsForAllUsers({ isInternetOn: false });
        }}
        onConfirm={() => {
          setShowInternetState(false);
          selectedProfiles.length > 0
            ? handleSetPermissionsForSelectedUsers({ isInternetOn: true })
            : handleSetPermissionsForAllUsers({ isInternetOn: true });
        }}
        title={t('schoolManagement.internetSettings')}
        message={
          selectedProfiles.length > 0
            ? t('schoolManagement.internetSettingsSelectedUserMessage')
            : t('schoolManagement.internetSettingsMessage')
        }
        confirmText={t('schoolManagement.turnOn')}
        members={selectedProfiles}
      />
      <SetPermissionsToStudentsDialog
        open={showPrinterState}
        onClose={() => {
          setShowPrinterState(false);
          selectedProfiles.length > 0
            ? handleSetPermissionsForSelectedUsers({ printerAccess: false })
            : handleSetPermissionsForAllUsers({ printerAccess: false });
        }}
        onConfirm={() => {
          setShowPrinterState(false);
          selectedProfiles.length > 0
            ? handleSetPermissionsForSelectedUsers({ printerAccess: true })
            : handleSetPermissionsForAllUsers({ printerAccess: true });
          selectedProfiles.splice(0, selectedProfiles.length);
        }}
        title={t('schoolManagement.printerSettings')}
        message={
          selectedProfiles.length > 0
            ? t('schoolManagement.printerSettingsSelectedUserMessage')
            : t('schoolManagement.printerSettingsMessage')
        }
        confirmText={t('schoolManagement.turnOn')}
        members={selectedProfiles}
      />
      <CollectFilesDialog
        open={collectState}
        onClose={() => setCollectState(false)}
        onConfirm={() => setCollectState(false)}
        title={t('schoolManagement.collectFiles')}
        message={
          selectedProfiles.length > 0
            ? t('schoolManagement.collectFilesSelectedUserMessage')
            : t('schoolManagement.collectFilesFromAllUsersMessage')
        }
        confirmText={t('schoolManagement.collect')}
        members={selectedProfiles}
      />
      <ShareFilesDialog
        open={shareState}
        onClose={() => setShareState(false)}
        onConfirm={() => setShareState(false)}
        title={t('schoolManagement.shareFiles')}
        message={
          selectedProfiles.length > 0
            ? t('schoolManagement.shareFilesSelectedUserMessage')
            : t('schoolManagement.shareFilesWithAllUsersMessage')
        }
        confirmText={t('schoolManagement.allRight')}
        members={selectedProfiles}
      />
      <ShowCollectedFilesDialog
        open={showFilesState}
        onClose={() => setShowFilesState(false)}
        onConfirm={() => setShowFilesState(false)}
        title={t('schoolManagement.showCollectedFiles')}
        message={t('schoolManagement.showCollectedFilesMessage')}
        confirmText={t('schoolManagement.allRight')}
      />
    </div>
  );
};

export default ManageContentPage;
