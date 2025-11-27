/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
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
  const { webdavShare } = useParams();
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
      share: dialog.edit ? values.share : (webdavShare as string),
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
