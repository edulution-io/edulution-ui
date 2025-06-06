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
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { type ExtendedOptionKeysType } from '@libs/appconfig/types/extendedOptionKeysType';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import UploadContentBody from '@/pages/FileSharing/utilities/UploadContentBody';
import { Button } from '@/components/shared/Button';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import HorizontalLoader from '@/components/ui/Loading/HorizontalLoader';
import useAppConfigTableDialogStore from './table/useAppConfigTableDialogStore';
import useAppConfigsStore from '../appConfigsStore';

interface UploadFileDialogProps {
  settingLocation: string;
  tableId: ExtendedOptionKeysType;
}

const UploadFileDialog: React.FC<UploadFileDialogProps> = ({ settingLocation, tableId }) => {
  const { t } = useTranslation();
  const { isLoading, uploadFile } = useAppConfigsStore();
  const { filesToUpload, setFilesToUpload } = useFileSharingDialogStore();

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
