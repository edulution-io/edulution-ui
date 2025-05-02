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
import { UseFormReturn } from 'react-hook-form';
import GroupForm from '@libs/groups/types/groupForm';
import GroupColumn from '@libs/groups/types/groupColumn';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import SharingFilesFailedDialogBody from '@/pages/ClassManagement/components/Dialogs/SharingFilesFailedDialogBody';
import { toast } from 'sonner';
import ProgressBox from '@/components/ui/ProgressBox';
import PageLayout from '@/components/structure/layout/PageLayout';
import QuotaLimitInfo from '@/pages/FileSharing/utilities/QuotaLimitInfo';
import useQuotaInfo from '@/hooks/useQuotaInfo';

const LessonPage = () => {
  const {
    userSessions,
    fetchProject,
    updateSession,
    createSession,
    removeSession,
    fetchSchoolClass,
    fetchUserSessions,
  } = useClassManagementStore();

  const { percentageUsed } = useQuotaInfo();

  const navigate = useNavigate();

  const { lmnApiToken, getOwnUser } = useLmnApiStore();
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
    filesharingProgress,
  } = useLessonStore();

  const { t } = useTranslation();
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [currentSelectedSession, setCurrentSelectedSession] = useState<LmnApiSession | null>(null);

  const [isFileSharingProgessInfoDialogOpen, setIsFileSharingProgessInfoDialogOpen] = useState(false);

  useEffect(() => {
    if (!filesharingProgress) return;

    const percent = filesharingProgress.percent ?? 0;
    const toasterData = {
      percent,
      title: t('filesharing.progressBox.title'),
      id: filesharingProgress.currentFilePath,
      description: t('filesharing.progressBox.fileInfo', {
        filename: filesharingProgress.currentFilePath.split('/').pop(),
        studentName: filesharingProgress.studentName,
      }),
      failed: filesharingProgress.failedPaths?.length || 0,
      processed: filesharingProgress.processed,
      total: filesharingProgress.total,
    };

    let toastDuration: number;
    if (toasterData.failed > 0) {
      toastDuration = Infinity;
    } else if (percent >= 100) {
      toastDuration = 5000;
    } else {
      toastDuration = Infinity;
    }

    toast(<ProgressBox data={toasterData} />, {
      id: toasterData.id,
      duration: toastDuration,
    });
  }, [filesharingProgress]);

  useEffect(() => {
    if (lmnApiToken) {
      void getOwnUser();
    }
  }, [lmnApiToken]);

  const fetchData = async () => {
    if (isPageLoading) return;

    setIsPageLoading(true);

    switch (groupTypeParams) {
      case UserGroups.Projects: {
        const project = await fetchProject(groupNameParams!);
        if (project?.members) {
          setMember(getUniqueValues([...project.members, ...project.admins]));
        }
        break;
      }
      case UserGroups.Sessions: {
        await fetchUserSessions();
        const session = userSessions.find((s) => s.name === groupNameParams);
        setCurrentSelectedSession(session || null);
        setMember(session?.members || []);
        break;
      }
      case UserGroups.Classes: {
        const schoolClass = await fetchSchoolClass(groupNameParams!);
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

    if (restoreTemporarySession) {
      navigate(`/${CLASS_MANAGEMENT_LESSON_PATH}/${groupTypeFromStore}/${groupNameFromStore}`, { replace: true });
      return;
    }

    if (groupTypeParams && groupNameParams && lmnApiToken) {
      setGroupTypeInStore(groupTypeParams);
      setGroupNameInStore(groupNameParams);
      void fetchData();
    }
  }, [groupTypeParams, groupNameParams, lmnApiToken]);

  const sessionOptions = userSessions.map((s) => ({ id: s.name, name: s.name }));

  const handleSessionSelect = (sessionId: string) => {
    const sessionName = sessionOptions.find((s) => s.id === sessionId)?.name;
    navigate(`/${CLASS_MANAGEMENT_LESSON_PATH}/sessions/${sessionName}`);
  };

  const onSaveSessionsButtonClick = () => {
    setOpenDialogType(UserGroups.Sessions);
    setUserGroupToEdit(currentSelectedSession || null);
  };

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

  useEffect(() => {
    const hasProgressCompleted = (filesharingProgress?.percent ?? 0) >= 100;
    const hasFailedPaths = (filesharingProgress?.failedPaths?.length ?? 0) > 0;
    setIsFileSharingProgessInfoDialogOpen(hasProgressCompleted && hasFailedPaths);
  }, [filesharingProgress]);

  return (
    <PageLayout>
      <div className="mb-2 flex flex-none flex-col gap-2 md:flex-row">
        <LoadingIndicatorDialog isOpen={isPageLoading || isLoading} />
        <UserProjectOrSchoolClassSearch />
        {sessionOptions && (
          <DropdownSelect
            options={sessionOptions}
            selectedVal={groupNameParams || ''}
            handleChange={handleSessionSelect}
            placeholder={t('classmanagement.selectSavedSession')}
            classname="md:w-1/3"
          />
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
      <QuotaLimitInfo percentageUsed={percentageUsed} />
      {groupNameParams || member.length ? <UserArea fetchData={fetchData} /> : <QuickAccess />}
      {openDialogType === UserGroups.Sessions && <GroupDialog item={sessionToSave} />}

      {filesharingProgress && filesharingProgress.failedPaths && (
        <AdaptiveDialog
          isOpen={isFileSharingProgessInfoDialogOpen}
          handleOpenChange={() => setIsFileSharingProgessInfoDialogOpen(!isFileSharingProgessInfoDialogOpen)}
          title={t('classmanagement.failDialog.title', {
            file: filesharingProgress.currentFilePath.split('/').pop(),
          })}
          body={
            <SharingFilesFailedDialogBody
              failedFilePath={filesharingProgress?.currentFilePath}
              affectedUsers={filesharingProgress?.failedPaths.map((path) => path.split('/').at(2) || '')}
              failedPaths={filesharingProgress?.failedPaths}
            />
          }
        />
      )}
    </PageLayout>
  );
};

export default LessonPage;
