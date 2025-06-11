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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ShareFileFolderLinkDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/ShareFileFolderLinkDialogBody';
import { z } from 'zod';
import publicShareFilesFormSchema from '@libs/filesharing/types/publicShareFilesFormSchema';
import { usePublicShareFilesStore } from '@/pages/FileSharing/publicShareFiles/usePublicShareFilesStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import PublicFileShareDto from '@libs/filesharing/types/publicFileShareDto';

type FormValues = z.infer<typeof publicShareFilesFormSchema>;

const EditPublicShareFileDialog = () => {
  const {
    selectedFilesToShareRows,
    isShareFileEditDialogOpen,
    isLoading,
    setIsShareFileEditDialogOpen,
    updatePublicShareFile,
  } = usePublicShareFilesStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(publicShareFilesFormSchema),
    defaultValues: {
      expires: undefined,
      invitedAttendees: [],
      invitedGroups: [],
      password: '',
    },
  });

  const onSubmit = async () => {
    const original = selectedFilesToShareRows[0];
    const values = form.getValues();

    const dto: PublicFileShareDto = {
      ...original,
      expires: values.expires,
      invitedAttendees: values.invitedAttendees ?? [],
      invitedGroups: values.invitedGroups ?? [],
      password: values.password || '',
    };

    await updatePublicShareFile(dto);
    setIsShareFileEditDialogOpen(false);
  };

  const handleClose = () => setIsShareFileEditDialogOpen(false);

  useEffect(() => {
    if (selectedFilesToShareRows.length === 1) {
      form.reset({
        expires: selectedFilesToShareRows[0].expires,
        invitedAttendees: selectedFilesToShareRows[0].invitedAttendees,
        invitedGroups: selectedFilesToShareRows[0].invitedGroups,
        password: selectedFilesToShareRows[0].password ?? '',
      });
    }
  }, [selectedFilesToShareRows]);

  const getDialogBody = () => {
    if (isLoading) return <CircleLoader className="mx-auto mt-5" />;
    return <ShareFileFolderLinkDialogBody form={form} />;
  };

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleClose}
      handleSubmit={onSubmit}
      submitButtonText="common.update"
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isShareFileEditDialogOpen}
      handleOpenChange={handleClose}
      title="filesharing.publicFileSharing.editPublicShareFile"
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default EditPublicShareFileDialog;
