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
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';

import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';

import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

import type CreateOrEditPublicShareDto from '@libs/filesharing/types/createOrEditPublicShareDto';
import SHARE_FORM_DEFAULTS from '@libs/filesharing/constants/shareFormDefaults';
import PUBLIC_SHARE_DIALOG_NAMES from '@libs/filesharing/constants/publicShareDialogNames';
import PUBLIC_SHARE_LINK_SCOPE from '@libs/filesharing/constants/publicShareLinkScope';
import CreateOrEditPublicShareDialogBody from './CreateOrEditPublicShareDialogBody';

interface Props {
  trigger?: React.ReactNode;
}

const CreateOrEditPublicShareDialog: React.FC<Props> = ({ trigger }) => {
  const { t } = useTranslation();

  const { selectedItems } = useFileSharingStore();
  const { dialog, closeDialog, createShare, updateShare, share } = usePublicShareStore();

  const currentFile = dialog.createLink ? selectedItems[0] : share;

  const form = useForm<CreateOrEditPublicShareDto>({
    defaultValues: SHARE_FORM_DEFAULTS,
    mode: 'onChange',
  });

  useEffect(() => {
    if (dialog.edit && share) {
      form.reset({
        scope: share.scope,
        expires: new Date(share.expires),
        invitedAttendees: share.invitedAttendees,
        invitedGroups: share.invitedGroups,
        password: share.password,
      });
    }
    if (dialog.createLink) {
      form.reset(SHARE_FORM_DEFAULTS);
    }
  }, [dialog.edit, dialog.createLink, share, form]);

  const handleClose = () => {
    closeDialog(dialog.edit ? PUBLIC_SHARE_DIALOG_NAMES.EDIT : PUBLIC_SHARE_DIALOG_NAMES.CREATE_LINK);
    form.reset();
  };

  const onSubmit = async (values: CreateOrEditPublicShareDto) => {
    const dto: CreateOrEditPublicShareDto = {
      ...values,
      filePath: currentFile.filePath,
      filename: currentFile.filename,
      etag: currentFile.etag,
      password: values.password ?? '',
    };

    if (dialog.edit) {
      await updateShare({ ...share, ...dto });
    } else {
      await createShare(dto);
    }
    handleClose();
  };

  return (
    <AdaptiveDialog
      isOpen={dialog.createLink || dialog.edit}
      trigger={trigger}
      handleOpenChange={handleClose}
      title={
        dialog.edit
          ? t('filesharing.publicFileSharing.editPublicShareFile')
          : t('filesharing.publicFileSharing.createNewFileLink')
      }
      body={<CreateOrEditPublicShareDialogBody form={form} />}
      footer={
        <DialogFooterButtons
          handleClose={handleClose}
          handleSubmit={form.handleSubmit(onSubmit)}
          submitButtonText={dialog.edit ? 'common.save' : 'common.create'}
          disableSubmit={
            form.formState.isSubmitting ||
            !form.formState.isValid ||
            form.formState.isLoading ||
            (form.watch('scope') === PUBLIC_SHARE_LINK_SCOPE.RESTRICTED &&
              !form?.watch('invitedAttendees')?.length &&
              !form?.watch('invitedGroups')?.length)
          }
        />
      }
    />
  );
};

export default CreateOrEditPublicShareDialog;
