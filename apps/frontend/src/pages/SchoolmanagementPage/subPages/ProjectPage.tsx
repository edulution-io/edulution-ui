import React, { useState } from 'react';
import PathContent from '@/pages/SchoolmanagementPage/components/PathComponent';
import CreateContentTypes from '@/pages/SchoolmanagementPage/CreateContentTypes';
import Input from '@/components/shared/Input';
import CreateContentDialog from '@/components/ui/Dialog/CreateContentDialog';
import { t } from 'i18next';
import useSchoolManagementStore from '@/pages/SchoolmanagementPage/store/schoolManagementStore.ts';
import { transformClasses } from '@/pages/SchoolmanagementPage/utilis/utilitys.ts';
import { ScrollArea } from '@/components/ui/ScrollArea.tsx';
import RenameItemDialog from '@/pages/SchoolmanagementPage/components/dialogs/RenameItemDialog.tsx';
import DeleteItemDialog from '@/pages/SchoolmanagementPage/components/dialogs/DeleteItemDialog.tsx';
import useSchoolManagementComponentStore from '@/pages/SchoolmanagementPage/store/schoolManagementComponentStore.ts';

const ProjectPage = () => {
  const { projects } = useSchoolManagementStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [, setCreateContentType] = useState<CreateContentTypes | undefined>();

  const handleInputChange = () => {};

  const submitProjectOrGroup = () => {
    setIsCreateDialogOpen(false);
  };

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

  return (
    <div className="rounded bg-transparent p-4 shadow">
      <div>
        <div className="mb-4 rounded bg-blue-100 p-4">
          <p className="text-blue-800">{t('schoolManagement.projectPage')}</p>
        </div>
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
        <ScrollArea className="max-h-[90vh] overflow-auto">
          <PathContent
            pathType="projects"
            data={transformClasses(projects)}
            setDialogTitle={setDialogTitle}
            setIsCreateDialogOpen={setIsCreateDialogOpen}
            setCreateContentType={setCreateContentType}
            isAdmin
          />
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
      </div>
    </div>
  );
};

export default ProjectPage;
