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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { usePublicShareFilesStore } from '@/pages/FileSharing/publicShareFiles/usePublicShareFilesStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import CreateEditPublicFileShareDto from '@libs/filesharing/types/createEditPublicFileShareDto';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import DEFAULT_FILE_LINK_EXPIRY from '@libs/filesharing/constants/defaultFileLinkExpiry';
import CreateEditNewFileLinkDialogBody from './CreateEditNewFileLinkDialogBody';

interface CreateNewPublicFileLinkDialogProps {
  trigger?: React.ReactNode;
}

const CreateEditNewFileLinkDialog: React.FC<CreateNewPublicFileLinkDialogProps> = ({ trigger }) => {
  const { t } = useTranslation();
  const { selectedItems } = useFileSharingStore();
  const { editMultipleFiles, setEditMultipleFiles, setSelectedFilesToShareRows } = usePublicShareFilesStore();
  const { setSelectedRows, setSelectedItems } = useFileSharingStore();
  const currentFile = editMultipleFiles[0] ?? selectedItems[0];

  const { setIsCreateNewFileLinkDialogOpen, isCreateNewFileLinkDialogOpen, createPublicShareFile } =
    usePublicShareFilesStore();

  const form = useForm<CreateEditPublicFileShareDto>({
    defaultValues: {
      scope: 'public',
      expires: DEFAULT_FILE_LINK_EXPIRY,
      invitedAttendees: [],
      invitedGroups: [],
      password: '',
    },
    mode: 'onChange',
  });

  const { reset } = form;

  const handleClose = () => {
    setEditMultipleFiles([]);
    setSelectedFilesToShareRows([]);
    setSelectedRows({});
    setSelectedItems([]);
    setIsCreateNewFileLinkDialogOpen(false);
    reset({
      expires: DEFAULT_FILE_LINK_EXPIRY,
      invitedAttendees: [],
      invitedGroups: [],
      password: '',
    });
  };

  const { expires, invitedAttendees, invitedGroups, password, scope } = form.getValues();

  const onSubmit = () => {
    const dto: CreateEditPublicFileShareDto = {
      scope,
      expires,
      filePath: currentFile.filePath,
      filename: currentFile.filename,
      etag: currentFile.etag,
      invitedAttendees,
      invitedGroups,
      password: password || undefined,
    };

    void createPublicShareFile(dto);
    setIsCreateNewFileLinkDialogOpen(false);
  };

  const getDialogBody = () => <CreateEditNewFileLinkDialogBody form={form} />;

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleClose}
      handleSubmit={onSubmit}
      submitButtonText="common.create"
      disableSubmit={form.formState.isSubmitting || !form.formState.isValid || form.formState.isLoading}
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isCreateNewFileLinkDialogOpen}
      trigger={trigger}
      handleOpenChange={handleClose}
      title={t('filesharing.publicFileSharing.createNewFileLink')}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default CreateEditNewFileLinkDialog;
