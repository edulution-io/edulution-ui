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

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { Form, FormControl, FormFieldSH, FormItem, FormLabel } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import InputWithActionIcons from '@/components/shared/InputWithActionIcons';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import MoveContentDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/MoveContentDialogBody';
import APPS from '@libs/appconfig/constants/apps';
import ContentType from '@libs/filesharing/types/contentType';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import useFileSharingMoveDialogStore from '@/pages/FileSharing/useFileSharingMoveDialogStore';
import useWikiStore from '@/pages/Wiki/store/useWikiStore';
import CreateWikiDto from '@libs/wiki/types/createWikiDto';

const WikiCreateDialog: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isCreateWikiDialogOpen, setIsCreateWikiDialogOpen, createWiki, isLoading } = useWikiStore();
  const { fetchWebdavShares, selectedWebdavShare } = useFileSharingStore();
  const { moveOrCopyItemToPath, reset: resetDialogStore } = useFileSharingDialogStore();
  const { reset: resetMoveDialogStore } = useFileSharingMoveDialogStore();
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  const form = useForm<CreateWikiDto>({
    defaultValues: { name: '', parentPath: '', share: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    if (showFolderPicker) {
      void fetchWebdavShares();
    }
  }, [showFolderPicker]);

  const handleClose = () => {
    setIsCreateWikiDialogOpen(false);
    setShowFolderPicker(false);
    form.reset();
    resetDialogStore();
    resetMoveDialogStore();
  };

  const handleSubmit = async () => {
    const { name: formName, parentPath: formPath, share: formShare } = form.getValues();
    if (!formName.trim() || !formPath.trim()) return;
    const newId = await createWiki(formName, formPath, formShare);
    handleClose();
    if (newId) {
      navigate(`/${APPS.WIKI}/${newId}`);
    }
  };

  const handleFolderConfirm = () => {
    if (moveOrCopyItemToPath?.filePath && selectedWebdavShare) {
      form.setValue('parentPath', moveOrCopyItemToPath.filePath, { shouldValidate: true });
      form.setValue('share', selectedWebdavShare, { shouldValidate: true });
    }
    resetDialogStore();
    resetMoveDialogStore();
    setShowFolderPicker(false);
  };

  const name = form.watch('name');
  const parentPath = form.watch('parentPath');

  const formBody = (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <FormField
          form={form}
          name="name"
          labelTranslationId="wiki.name"
          placeholder={t('wiki.namePlaceholder')}
          variant="dialog"
        />
        <FormFieldSH
          control={form.control}
          name="parentPath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <p className="font-bold">{t('wiki.parentPath')}</p>
              </FormLabel>
              <FormControl>
                <InputWithActionIcons
                  {...field}
                  readOnly
                  placeholder={t('wiki.parentPathPlaceholder')}
                  variant="dialog"
                  actionIcons={[
                    {
                      icon: faFolderOpen,
                      onClick: () => setShowFolderPicker(true),
                    },
                  ]}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );

  const folderPickerBody = (
    <MoveContentDialogBody
      fileType={ContentType.DIRECTORY}
      isCurrentPathDefaultDestination
      showSelectedFile={false}
    />
  );

  const formFooter = (
    <DialogFooterButtons
      handleClose={handleClose}
      handleSubmit={handleSubmit}
      submitButtonText={t('common.create')}
      disableSubmit={!name.trim() || !parentPath.trim() || isLoading}
    />
  );

  const folderPickerFooter = (
    <DialogFooterButtons
      handleClose={() => setShowFolderPicker(false)}
      handleSubmit={handleFolderConfirm}
      submitButtonText={t('select')}
      disableSubmit={!moveOrCopyItemToPath?.filePath}
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isCreateWikiDialogOpen}
      handleOpenChange={handleClose}
      title={showFolderPicker ? t('wiki.selectParentPath') : t('wiki.createWiki')}
      body={showFolderPicker ? folderPickerBody : formBody}
      footer={showFolderPicker ? folderPickerFooter : formFooter}
    />
  );
};

export default WikiCreateDialog;
