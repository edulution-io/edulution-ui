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
import { DropdownSelect } from '@/components';
import { CLASS_MANAGEMENT_LESSON_PATH } from '@libs/classManagement/constants/classManagementPaths';
import { useTranslation } from 'react-i18next';
import GroupDialog from '@/pages/ClassManagement/components/GroupDialog/GroupDialog';
import { FaAddressCard } from 'react-icons/fa';
import getUniqueValues from '@libs/lmnApi/utils/getUniqueValues';
import useLmnApiStore from '@/store/useLmnApiStore';
import { FILTER_BAR_ID } from '@libs/classManagement/constants/pageElementIds';
import { UseFormReturn } from 'react-hook-form';
import GroupForm from '@libs/groups/types/groupForm';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';

const LessonPage = () => {
  const { userSessions, fetchProject, updateSession, createSession, removeSession, fetchSchoolClass } =
    useClassManagementStore();
  const { getOwnUser } = useLmnApiStore();
  const { groupType, groupName } = useParams();
  const {
    isLoading,
    openDialogType,
    setOpenDialogType,
    setUserGroupToEdit,
    member,
    setMember,
    setCurrentGroupName,
    setCurrentGroupType,
    currentGroupName,
    currentGroupType,
  } = useLessonStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isPageLoading, setIsPageLoading] = useState(false);

  const [currentSelectedSession, setCurrentSelectedSession] = useState<LmnApiSession | undefined>();
  console.log(`isAlreadySavedSession ${JSON.stringify(currentSelectedSession, null, 2)}`);

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
        setMember(currentSelectedSession?.members || []);
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
    console.log(`restoreTemporarySession ${JSON.stringify(restoreTemporarySession, null, 2)}`);
    const fetchInitialData =
      (groupType && groupType !== currentGroupType) || (groupName && groupName !== currentGroupName);
    console.log(`fetchInitialData ${JSON.stringify(fetchInitialData, null, 2)}`);
    if (restoreTemporarySession) {
      navigate(`/${CLASS_MANAGEMENT_LESSON_PATH}/${currentGroupType}/${currentGroupName}`, { replace: true });
    } else if (fetchInitialData) {
      setCurrentGroupType(groupType);
      setCurrentGroupName(groupName);
      void fetchData();
    }
  }, [groupType, groupName]);

  useEffect(() => {
    const currentSession = userSessions.find((session) => session.name === groupName);
    setCurrentSelectedSession(currentSession);
    setMember(currentSession?.members || []);
  }, [userSessions]);

  const handleSessionSelect = (sessionName: string) => {
    navigate(`/${CLASS_MANAGEMENT_LESSON_PATH}/sessions/${sessionName}`);
  };

  const onSaveSessionsButtonClick = () => {
    setOpenDialogType(UserGroups.Sessions);
    setUserGroupToEdit(currentSelectedSession || null);
  };

  const sessionOptions = userSessions.map((s) => ({ id: s.sid, name: s.name }));

  const closeSession = () => {
    setMember([]);
    setCurrentGroupType();
    setCurrentGroupName();
    navigate(`/${CLASS_MANAGEMENT_LESSON_PATH}`);
  };

  const createSessionAndNavigate = async (form: UseFormReturn<GroupForm>): Promise<void> => {
    await createSession(form);
    navigate(`/${CLASS_MANAGEMENT_LESSON_PATH}/sessions/${form.getValues().name}`);
  };

  const sessionToSave = {
    name: UserGroups.Sessions,
    translationId: 'mySessions',
    createFunction: createSessionAndNavigate,
    updateFunction: updateSession,
    removeFunction: async (id: string) => {
      console.log('remove session');
      await removeSession(id);
      setOpenDialogType(null);
      navigate(`/${CLASS_MANAGEMENT_LESSON_PATH}`);
    },
    icon: <FaAddressCard className="h-6 w-6" />,
    groups: userSessions,
  };

  return (
    <>
      <div
        className="my-2 flex flex-col gap-2 md:flex-row"
        id={FILTER_BAR_ID}
      >
        <LoadingIndicator isOpen={isPageLoading || isLoading} />
        <UserProjectOrSchoolClassSearch />
        {sessionOptions && (
          <div className="md:w-1/3">
            <DropdownSelect
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
              className="flex h-[42px] cursor-pointer items-center rounded-md bg-ciDarkGrey text-ciLightGrey hover:opacity-90"
            >
              <span className="text-nowrap px-4">
                {t(`classmanagement.${currentSelectedSession ? 'editSession' : 'saveSession'}`)}
              </span>
              <MdSave className="ml-auto inline-block h-8 w-8 pr-2" />
            </button>
            <button
              type="button"
              onClick={closeSession}
              className="flex h-[42px] cursor-pointer items-center rounded-md bg-ciDarkGrey text-ciLightGrey hover:opacity-90"
            >
              <span className="text-nowrap pl-4">{t('classmanagement.closeSession')}</span>
              <MdClose className="ml-auto inline-block h-8 w-8 px-2" />
            </button>
          </div>
        ) : null}
      </div>
      <div>{groupName || member.length ? <UserArea /> : <QuickAccess />}</div>
      {openDialogType === UserGroups.Sessions && <GroupDialog item={sessionToSave} />}
    </>
  );
};

export default LessonPage;
