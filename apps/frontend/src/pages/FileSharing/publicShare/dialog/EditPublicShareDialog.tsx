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

import React, { useEffect } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { usePublicShareStore } from '@/pages/FileSharing/publicShare/usePublicShareStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import CreateEditNewPublicShareDialogBody from '@/pages/FileSharing/publicShare/dialog/CreateEditNewPublicShareDialogBody';
import type PublicFileShareDto from '@libs/filesharing/types/publicFileShareDto';
import DEFAULT_FILE_LINK_EXPIRY from '@libs/filesharing/constants/defaultFileLinkExpiry';
import CreateEditPublicFileShareDto from '@libs/filesharing/types/createEditPublicFileShareDto';
import { useTranslation } from 'react-i18next';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';

const EditPublicShareDialog: React.FC = () => {
  const {
    setSelectedPublicShareRows,
    selectedContentToShareRows,
    isPublicShareEditDialogOpen,
    isLoading,
    setIsPublicShareEditDialogOpen,
    editMultipleContent,
    setEditMultipleContent,
    updatePublicShare,
    setSelectedRows: setShareRows,
  } = usePublicShareStore();

  const { setSelectedRows: setTableRows, setSelectedItems } = useFileSharingStore();

  const { t } = useTranslation();

  const form: UseFormReturn<CreateEditPublicFileShareDto> = useForm<CreateEditPublicFileShareDto>({
    mode: 'onChange',
    defaultValues: {
      scope: 'public',
      expires: DEFAULT_FILE_LINK_EXPIRY,
      invitedAttendees: [],
      invitedGroups: [],
      password: '',
    },
  });

  const currentFile = editMultipleContent[0] ?? selectedContentToShareRows[0];

  const isFileRestricted = currentFile?.invitedAttendees.length > 0 || currentFile?.invitedGroups.length > 0;

  useEffect(() => {
    if (currentFile) {
      form.reset({
        scope: isFileRestricted ? 'restricted' : 'public',
        expires: new Date(currentFile.expires),
        invitedAttendees: currentFile.invitedAttendees,
        invitedGroups: currentFile.invitedGroups,
        password: currentFile?.password,
      });
    }
  }, [editMultipleContent, form]);

  const onSubmit = async () => {
    const { scope, expires, invitedAttendees = [], invitedGroups = [], password = '' } = form.getValues();

    const dto: PublicFileShareDto = {
      ...currentFile,
      expires,
      invitedAttendees,
      invitedGroups,
      password,
      scope,
    };

    await updatePublicShare(dto);
    setIsPublicShareEditDialogOpen(false);
  };

  const handleClose = () => {
    setEditMultipleContent([]);
    setSelectedPublicShareRows([]);
    setShareRows({});
    setTableRows({});
    setSelectedItems([]);
    setIsPublicShareEditDialogOpen(false);
    form.reset();
  };

  const body = isLoading ? (
    <CircleLoader className="mx-auto mt-5" />
  ) : (
    <CreateEditNewPublicShareDialogBody form={form} />
  );

  const footer = (
    <DialogFooterButtons
      handleClose={handleClose}
      handleSubmit={onSubmit}
      submitButtonText="common.update"
      disableSubmit={
        form.formState.isSubmitting ||
        !form.formState.isValid ||
        form.formState.isLoading ||
        (form.getValues('scope') === 'restricted' &&
          !form.getValues('invitedAttendees')?.length &&
          !form.getValues('invitedGroups')?.length)
      }
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isPublicShareEditDialogOpen}
      handleOpenChange={handleClose}
      title={t('filesharing.publicFileSharing.editPublicShareFile')}
      body={body}
      footer={footer}
    />
  );
};

export default EditPublicShareDialog;
