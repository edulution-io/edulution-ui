/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QuickAccess from '@/pages/ClassManagement/LessonPage/QuickAccess/QuickAccess';
import UserProjectOrSchoolClassSearch from '@/pages/ClassManagement/LessonPage/UserProjectOrSchoolClassSearch';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import UserArea from '@/pages/ClassManagement/LessonPage/UserArea/UserArea';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
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
import GroupColumn from '@libs/groups/types/groupColumn';

const LessonPage = () => {
  const { userSessions, fetchProject, updateSession, createSession, removeSession, fetchSchoolClass } =
    useClassManagementStore();
  const { getOwnUser } = useLmnApiStore();
  const { groupType: groupTypeParams, groupName: groupNameParams } = useParams();
  const {
    isLoading,
    openDialogType,
    setOpenDialogType,
    setUserGroupToEdit,
    member,
    setMember,
    setGroupNameInStore,
    setGroupTypeInStore,
    groupNameFromStore,
    groupTypeFromStore,
  } = useLessonStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isPageLoading, setIsPageLoading] = useState(false);

  const currentSelectedSession = userSessions.find((session) => session.name === groupNameParams);

  useEffect(() => {
    void getOwnUser();
  }, []);

  const fetchData = async () => {
    if (!groupNameParams) return;

    setIsPageLoading(true);

    switch (groupTypeParams) {
      case UserGroups.Projects: {
        const project = await fetchProject(groupNameParams);
        if (project?.members) {
          setMember(getUniqueValues([...project.members, ...project.admins]));
        }
        break;
      }
      case UserGroups.Sessions:
        setMember(currentSelectedSession?.members || []);
        break;
      case UserGroups.Classes: {
        const schoolClass = await fetchSchoolClass(groupNameParams);
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
    const restoreTemporarySession = !!(
      groupTypeFromStore &&
      groupNameFromStore &&
      !groupTypeParams &&
      !groupNameParams
    );

    const fetchInitialData =
      !!(groupTypeParams && groupTypeParams !== groupTypeFromStore) ||
      !!(groupNameParams && groupNameParams !== groupNameFromStore);

    if (restoreTemporarySession) {
      navigate(`/${CLASS_MANAGEMENT_LESSON_PATH}/${groupTypeFromStore}/${groupNameFromStore}`, { replace: true });
    } else if (fetchInitialData) {
      setGroupTypeInStore(groupTypeParams);
      setGroupNameInStore(groupNameParams);
      void fetchData();
    }
  }, [groupTypeParams, groupNameParams]);

  useEffect(() => {
    setMember(currentSelectedSession?.members || []);
    if (!isLoading) setIsPageLoading(false);
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
    setGroupTypeInStore();
    setGroupNameInStore();
    navigate(`/${CLASS_MANAGEMENT_LESSON_PATH}`);
  };

  const createSessionAndNavigate = async (form: UseFormReturn<GroupForm>): Promise<void> => {
    setIsPageLoading(true);
    await createSession(form);
    navigate(`/${CLASS_MANAGEMENT_LESSON_PATH}/sessions/${form.getValues().name}`);
  };

  const updateSessionWithLoading = async (form: UseFormReturn<GroupForm>): Promise<void> => {
    setIsPageLoading(true);
    await updateSession(form);
  };

  const sessionToSave: GroupColumn = {
    name: UserGroups.Sessions,
    translationId: 'mySessions',
    createFunction: createSessionAndNavigate,
    updateFunction: updateSessionWithLoading,
    removeFunction: async (id: string) => {
      await removeSession(id);
      setOpenDialogType(null);
      closeSession();
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
        <LoadingIndicatorDialog isOpen={isPageLoading || isLoading} />
        <UserProjectOrSchoolClassSearch />
        {sessionOptions && (
          <div className="md:w-1/3">
            <DropdownSelect
              options={sessionOptions}
              selectedVal={groupNameParams || t('classmanagement.selectSavedSession')}
              handleChange={handleSessionSelect}
            />
          </div>
        )}
        {groupNameParams || member.length ? (
          <div className="flex flex-row justify-between gap-2">
            <button
              type="button"
              onClick={onSaveSessionsButtonClick}
              className="flex h-[42px] cursor-pointer items-center rounded-md bg-accent text-secondary hover:opacity-90"
            >
              <span className="text-nowrap px-4 text-background">
                {t(`classmanagement.${currentSelectedSession ? 'editSession' : 'saveSession'}`)}
              </span>
              <MdSave className="ml-auto inline-block h-8 w-8 pr-2" />
            </button>
            <button
              type="button"
              onClick={closeSession}
              className="flex h-[42px] cursor-pointer items-center rounded-md bg-accent text-secondary hover:opacity-90"
            >
              <span className="text-nowrap pl-4 text-background">{t('classmanagement.closeSession')}</span>
              <MdClose className="ml-auto inline-block h-8 w-8 px-2" />
            </button>
          </div>
        ) : null}
      </div>
      <div>{groupNameParams || member.length ? <UserArea /> : <QuickAccess />}</div>
      {openDialogType === UserGroups.Sessions && <GroupDialog item={sessionToSave} />}
    </>
  );
};

export default LessonPage;
