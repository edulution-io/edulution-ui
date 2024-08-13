import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QuickAccess from '@/pages/ClassManagement/LessonPage/QuickAccess/QuickAccess';
import UserProjectOrSchoolClassSearch from '@/pages/ClassManagement/LessonPage/UserProjectOrSchoolClassSearch';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import UserArea from '@/pages/ClassManagement/LessonPage/UserArea/UserArea';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';
import UserGroups from '@libs/groups/types/userGroups.enum';
import { MdClose, MdSave } from 'react-icons/md';
import { DropdownMenu } from '@/components';
import { CLASS_MANAGEMENT_LESSON_PATH } from '@libs/classManagement/constants/classManagementPaths';
import { useTranslation } from 'react-i18next';
import GroupDialog from '@/pages/ClassManagement/components/GroupDialog/GroupDialog';
import { FaAddressCard } from 'react-icons/fa';
import getUniqueValues from '@libs/lmnApi/utils/getUniqueValues';
import useLmnApiStore from '@/store/useLmnApiStore';

const LessonPage = () => {
  const { userSessions, fetchProject, updateSession, createSession, removeSession, fetchSchoolClass } =
    useClassManagementStore();
  const { getOwnUser } = useLmnApiStore();
  const { groupType, groupName } = useParams();
  const {
    isLoading,
    setOpenDialogType,
    setUserGroupToEdit,
    member,
    setMember,
    setCurrentGroupName,
    setCurrentGroupType,
    currentGroupName,
    currentGroupType,
  } = useLessonStore();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isPageLoading, setIsPageLoading] = useState(false);

  useEffect(() => {
    void getOwnUser();
  }, []);

  const fetchData = async () => {
    if (!groupName) return;

    setIsPageLoading(true);

    switch (groupType) {
      case UserGroups.Projects: {
        const project = await fetchProject(groupName);
        if (project?.members) {
          setMember(getUniqueValues([...project.members, ...project.admins]));
        }
        break;
      }
      case UserGroups.Sessions:
        setMember(userSessions.find((session) => session.name === groupName)?.members || []);
        break;
      case UserGroups.Classes: {
        const schoolClass = await fetchSchoolClass(groupName);
        if (schoolClass?.members) {
          setMember(getUniqueValues([...schoolClass.members]));
        }
        break;
      }
      default:
    }
    setIsPageLoading(false);
  };

  useEffect(() => {
    const restoreTemporarySession = currentGroupType && currentGroupName && !groupType && !groupName;
    const fetchInitialData =
      (groupType && groupType !== currentGroupType) || (groupName && groupName !== currentGroupName);

    if (restoreTemporarySession) {
      navigate(`/${CLASS_MANAGEMENT_LESSON_PATH}/${currentGroupType}/${currentGroupName}`, { replace: true });
    } else if (fetchInitialData) {
      setCurrentGroupType(groupType);
      setCurrentGroupName(groupName);
      void fetchData();
    }
  }, [groupType, groupName]);

  const handleSessionSelect = (sessionName: string) => {
    navigate(`/${CLASS_MANAGEMENT_LESSON_PATH}/sessions/${sessionName}`);
  };

  const onSaveSessionsButtonClick = () => {
    setIsDialogOpen(true);
    setOpenDialogType(UserGroups.Sessions);
    setUserGroupToEdit(userSessions.find((session) => session.name === groupName) || null);
  };

  const sessionOptions = userSessions.map((s) => ({ id: s.sid, name: s.name }));

  const closeSession = () => {
    setMember([]);
    setCurrentGroupType();
    setCurrentGroupName();
    navigate(`/${CLASS_MANAGEMENT_LESSON_PATH}`);
  };

  const sessionToSave = {
    name: UserGroups.Sessions,
    translationId: 'mySessions',
    createFunction: createSession,
    updateFunction: updateSession,
    removeFunction: async (id: string) => {
      await removeSession(id);
      setOpenDialogType(null);
      navigate(`/${CLASS_MANAGEMENT_LESSON_PATH}`);
    },
    icon: <FaAddressCard className="h-6 w-6" />,
    groups: userSessions,
  };

  return (
    <div>
      <div className="my-2 flex flex-col gap-2 md:flex-row">
        <LoadingIndicator isOpen={isPageLoading || isLoading} />
        <UserProjectOrSchoolClassSearch />
        {sessionOptions && (
          <div className="md:w-1/3">
            <DropdownMenu
              options={sessionOptions}
              selectedVal={groupName || t('classmanagement.selectSavedSession')}
              handleChange={handleSessionSelect}
            />
          </div>
        )}
        {groupName || member.length ? (
          <div className="flex flex-row justify-between gap-2">
            <button
              type="button"
              onClick={onSaveSessionsButtonClick}
              className="flex h-[42px] cursor-pointer items-center rounded-md bg-background text-foreground hover:opacity-90"
            >
              <span className="text-nowrap px-4">{t('classmanagement.saveSession')}</span>
              <MdSave className="ml-auto inline-block h-8 w-8 pr-2" />
            </button>
            <button
              type="button"
              onClick={closeSession}
              className="flex h-[42px] cursor-pointer items-center rounded-md bg-background text-foreground hover:opacity-90"
            >
              <span className="text-nowrap pl-4">{t('classmanagement.closeSession')}</span>
              <MdClose className="ml-auto inline-block h-8 w-8 px-2" />
            </button>
          </div>
        ) : null}
      </div>
      <div>{groupName || member.length ? <UserArea /> : <QuickAccess />}</div>
      {isDialogOpen && <GroupDialog item={sessionToSave} />}
    </div>
  );
};

export default LessonPage;
