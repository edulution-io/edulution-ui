import useLmnUserStore from '@/store/lmnApiStore';
import userStore from '@/store/userStore';
import useSchoolManagementStore from '@/pages/SchoolmanagementPage/store/schoolManagementStore';
import React, { ChangeEvent, useEffect, useState } from 'react';
import CreateContentTypes from '@/pages/SchoolmanagementPage/CreateContentTypes';
import { ScrollArea } from '@/components/ui/ScrollArea';
import Input from '@/components/shared/Input';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import { useSearchParams } from 'react-router-dom';

import PathContent from '@/pages/SchoolmanagementPage/components/PathComponent';
import ManageClassPage from '@/pages/SchoolmanagementPage/subPages/ManageClassPage';
import { transformClasses } from '@/pages/SchoolmanagementPage/utilis/utilitys';
import CreateContentDialog from '@/components/ui/Dialog/CreateContentDialog';
import { t } from 'i18next';
import RenameItemDialog from '@/pages/SchoolmanagementPage/components/dialogs/RenameItemDialog.tsx';
import useSchoolManagementComponentStore from '@/pages/SchoolmanagementPage/store/schoolManagementComponentStore.ts';
import DeleteItemDialog from '@/pages/SchoolmanagementPage/components/dialogs/DeleteItemDialog.tsx';

const LessonPage = () => {
  const { userData, getUserData } = useLmnUserStore();
  const { user, userInfo } = userStore();
  const { schoolclasses, availableSessions, projects, getSessions, createSession, createProject, deleteSession } =
    useSchoolManagementStore();
  const {
    isEditModalOpen,
    setIsEditModalOpen,
    setIsDeleteModalOpen,
    isDeleteModalOpen,
    isCopyModalOpen,
    setIsCopyModalOpen,
    editModalItem,
    copyModalItem,
    deleteModalItem,
  } = useSchoolManagementComponentStore();

  const [projectClassName, setProjectClassName] = useState<string>('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [createContentType, setCreateContentType] = useState<CreateContentTypes>();
  const [searchParams] = useSearchParams();
  const classParam = searchParams.get('class');
  const projectParam = searchParams.get('project');
  const sessionParam = searchParams.get('session');

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setProjectClassName(event.target.value);
  };

  const createNewProject = () => {
    if ((!user && !userData) || userData === null) return;
    createProject(user, projectClassName, userData?.school)
      .then(() => getUserData().catch(console.error))
      .catch(console.error);
  };

  const createNewSession = () => {
    if (!user) return;
    createSession(user, projectClassName)
      .then(() => getSessions(user))
      .catch(console.error);
  };

  const removeSession = async (sid: string) => {
    await deleteSession(user, sid)
      .then(() => getSessions(user))
      .catch(console.error);
  };

  const submitProjectOrGroup = () => {
    setIsCreateDialogOpen(false);
    setProjectClassName('');
    if (createContentType === CreateContentTypes.CREATE_PROJECT) {
      createNewProject();
    }
    if (createContentType === CreateContentTypes.CREATE_GROUP) {
      createNewSession();
    }
  };

  useEffect(() => {
    if (user) {
      getSessions(user).catch(console.error);
    }
  }, [user]);

  const isUserAdmin = userData?.isAdmin || false;

  return (
    <div>
      {classParam || projectParam || sessionParam ? (
        <ManageClassPage />
      ) : (
        <ScrollArea className="max-h-[90vh] overflow-auto">
          <CreateContentDialog
            isOpen={isCreateDialogOpen}
            title={dialogTitle}
            onSubmit={submitProjectOrGroup}
            isDisabled={false}
            onOpenChange={setIsCreateDialogOpen}
          >
            <Input
              variant="default"
              className="bg-white"
              onChange={handleInputChange}
            />
          </CreateContentDialog>
          <AccordionSH
            type="multiple"
            defaultValue={['schoolclasses', 'groups', 'projects']}
          >
            <div className="flex flex-col justify-between p-4">
              <AccordionItem value="schoolclasses">
                <AccordionTrigger className="my-4 text-xl font-bold">
                  {t('schoolManagement.myClasses')}
                </AccordionTrigger>
                <AccordionContent>
                  <PathContent
                    pathType="schoolclasses"
                    data={transformClasses(schoolclasses)}
                    isAdmin={isUserAdmin}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="groups">
                <AccordionTrigger className="my-4 text-xl font-bold">{t('schoolManagement.myGroups')}</AccordionTrigger>
                <AccordionContent>
                  <PathContent
                    pathType="sessions"
                    data={availableSessions}
                    setDialogTitle={setDialogTitle}
                    setIsCreateDialogOpen={setIsCreateDialogOpen}
                    setCreateContentType={setCreateContentType}
                    isAdmin={isUserAdmin}
                    deleteSession={removeSession}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="projects">
                <AccordionTrigger className="my-4 text-xl font-bold">
                  {t('schoolManagement.myProjects')}
                </AccordionTrigger>
                <AccordionContent>
                  {userInfo && (
                    <PathContent
                      pathType="projects"
                      data={transformClasses(projects)}
                      setDialogTitle={setDialogTitle}
                      setIsCreateDialogOpen={setIsCreateDialogOpen}
                      setCreateContentType={setCreateContentType}
                      isAdmin={isUserAdmin}
                    />
                  )}
                </AccordionContent>
              </AccordionItem>
            </div>
          </AccordionSH>
          {isEditModalOpen && (
            <RenameItemDialog
              isCopy={false}
              isOpen={isEditModalOpen}
              onOpenChange={() => {
                setIsEditModalOpen(false);
              }}
              item={editModalItem || { itemEditName: '', type: '' }}
            />
          )}
          {isDeleteModalOpen && (
            <DeleteItemDialog
              isOpen={isDeleteModalOpen}
              onOpenChange={() => {
                setIsDeleteModalOpen(false);
              }}
              item={deleteModalItem || { itemEditName: '', type: '' }}
            />
          )}
          {isCopyModalOpen && (
            <RenameItemDialog
              isOpen={isCopyModalOpen}
              isCopy={true}
              onOpenChange={() => {
                setIsCopyModalOpen(false);
              }}
              item={copyModalItem || { itemEditName: '', type: '' }}
            />
          )}
        </ScrollArea>
      )}
    </div>
  );
};

export default LessonPage;
