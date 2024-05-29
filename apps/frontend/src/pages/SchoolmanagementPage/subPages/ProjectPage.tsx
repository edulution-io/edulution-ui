import React, { useState } from 'react';
import PathContent from '@/pages/SchoolmanagementPage/components/PathComponent';
import CreateContentTypes from '@/pages/SchoolmanagementPage/CreateContentTypes';
import useUserStore from '@/store/userStore';
import Input from '@/components/shared/Input';
import CreateContentDialog from '@/components/ui/Dialog/CreateContentDialog';
import { t } from 'i18next';

const ProjectPage = () => {
  const { userInfo } = useUserStore();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [dialogTitle, setDialogTitle] = useState<string>('');
  const [, setCreateContentType] = useState<CreateContentTypes | undefined>();

  const handleInputChange = () => {};

  const submitProjectOrGroup = () => {
    setIsCreateDialogOpen(false);
  };

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
        <PathContent
          pathType="projects"
          data={userInfo.ldapGroups.projects}
          setDialogTitle={setDialogTitle}
          setIsCreateDialogOpen={setIsCreateDialogOpen}
          setCreateContentType={setCreateContentType}
          isAdmin
        />
      </div>
    </div>
  );
};

export default ProjectPage;
