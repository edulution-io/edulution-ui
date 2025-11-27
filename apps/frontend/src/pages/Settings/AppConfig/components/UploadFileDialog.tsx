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

import React from 'react';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { type ExtendedOptionKeysType } from '@libs/appconfig/types/extendedOptionKeysType';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import UploadContentBody from '@/pages/FileSharing/utilities/UploadContentBody';
import { Button } from '@/components/shared/Button';
import HorizontalLoader from '@/components/ui/Loading/HorizontalLoader';
import useHandelUploadFileStore from '@/pages/FileSharing/Dialog/upload/useHandelUploadFileStore';
import useAppConfigTableDialogStore from './table/useAppConfigTableDialogStore';
import useAppConfigsStore from '../useAppConfigsStore';

interface UploadFileDialogProps {
  settingLocation: string;
  tableId: ExtendedOptionKeysType;
}

const UploadFileDialog: React.FC<UploadFileDialogProps> = ({ settingLocation, tableId }) => {
  const { t } = useTranslation();
  const { isLoading, uploadFile } = useAppConfigsStore();
  const { filesToUpload, setFilesToUpload } = useHandelUploadFileStore();

  const { isDialogOpen, setDialogOpen } = useAppConfigTableDialogStore();
  const isOpen = isDialogOpen === tableId;

  const getDialogBody = () => (
    <>
      {isLoading && <HorizontalLoader />}
      <UploadContentBody />
    </>
  );

  const handleUpload = async () => {
    try {
      await Promise.all(
        filesToUpload.map(async (file) => {
          const response = await uploadFile(settingLocation, file);

          if (!response) {
            throw new Error('File upload failed');
          }
        }),
      );

      toast.success(t('settings.appconfig.sections.files.uploadSuccess'));

      setFilesToUpload([]);
      setDialogOpen('');
    } catch (error) {
      toast.error(t('settings.appconfig.sections.files.uploadFailed'));
    }
  };

  const getDialogFooter = () => (
    <>
      <Button
        variant="btn-outline"
        size="lg"
        type="button"
        onClick={() => setDialogOpen('')}
        disabled={isLoading}
      >
        {t('common.cancel')}
      </Button>
      <Button
        variant="btn-collaboration"
        size="lg"
        type="button"
        onClick={handleUpload}
        disabled={isLoading || filesToUpload.length === 0}
      >
        {t('common.upload')}
      </Button>
    </>
  );

  return (
    <AdaptiveDialog
      title={t('filesharingUpload.title')}
      isOpen={isOpen}
      body={getDialogBody()}
      footer={getDialogFooter()}
      handleOpenChange={() => setDialogOpen('')}
    />
  );
};

export default UploadFileDialog;
