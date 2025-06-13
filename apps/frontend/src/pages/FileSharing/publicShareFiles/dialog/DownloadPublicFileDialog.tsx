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

import { usePublicShareFilesStore } from '@/pages/FileSharing/publicShareFiles/usePublicShareFilesStore';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import React, { useEffect } from 'react';
import { t } from 'i18next';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import usePublicShareFilePageStore from '@/pages/FileSharing/publicShareFiles/publicPage/usePublicShareFilePageStore';
import useUserStore from '@/store/UserStore/UserStore';
import PublicFileDownloadInfo from '@/pages/FileSharing/publicShareFiles/publicPage/PublicFileDownloadInfo';
import buildAbsolutePublicDownloadUrl from '@libs/filesharing/utils/buildAbsolutePublicDownloadUrl';

interface DeletePublicFileDialoggProps {
  trigger?: React.ReactNode;
}

const DownloadPublicFileDialog: React.FC<DeletePublicFileDialoggProps> = ({ trigger }) => {
  const {
    isLoading,
    setIsShareFileDeleteDialogOpen,
    fetchPublicShareFilesById,
    publicShareFile,
    isPasswordRequired,
    isAccessRestricted,
  } = usePublicShareFilesStore();
  const { openShareInfoDialog, closeDialog, shareId } = usePublicShareFilePageStore();
  const { eduApiToken } = useUserStore();

  useEffect(() => {
    if (!shareId) return;

    const load = async () => {
      await fetchPublicShareFilesById(shareId, eduApiToken);
    };

    void load();
  }, [shareId, eduApiToken, fetchPublicShareFilesById]);

  const onSubmit = () => {
    setIsShareFileDeleteDialogOpen(false);
    closeDialog();
  };

  const handleClose = () => closeDialog();

  const getDialogBody = () => {
    if (isLoading) return <CircleLoader className="mx-auto mt-5" />;

    if (isAccessRestricted || !publicShareFile) {
      return (
        <div className="text-center">
          <p>{t('filesharing.publicFileSharing.errors.PublicFileIsRestricted')}</p>
        </div>
      );
    }
    const { filename, creator, expires, fileLink } = publicShareFile;
    const absoluteUrl = buildAbsolutePublicDownloadUrl(fileLink);
    return (
      <PublicFileDownloadInfo
        filename={filename}
        creator={creator}
        expires={new Date(expires)}
        absoluteUrl={absoluteUrl}
        isPasswordRequired={isPasswordRequired}
        authToken={eduApiToken}
      />
    );
  };

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleClose}
      handleSubmit={onSubmit}
      hideSubmitButton
    />
  );

  return (
    <AdaptiveDialog
      isOpen={openShareInfoDialog}
      trigger={trigger}
      handleOpenChange={handleClose}
      title={t('filesharing.publicFileSharing.downloadPublicFile')}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default DownloadPublicFileDialog;
