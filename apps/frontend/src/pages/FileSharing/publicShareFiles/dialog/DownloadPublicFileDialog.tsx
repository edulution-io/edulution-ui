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

interface DeletePublicFileDialoggProps {
  trigger?: React.ReactNode;
}

const DownloadPublicFileDialog: React.FC<DeletePublicFileDialoggProps> = ({ trigger }) => {
  const { isLoading, setIsShareFileDeleteDialogOpen, fetchPublicShareFilesById, publicShareFile } =
    usePublicShareFilesStore();
  const { openShareInfoDialog, closeDialog, shareId } = usePublicShareFilePageStore();
  const { eduApiToken } = useUserStore();

  useEffect(() => {
    if (!shareId) return;
    void fetchPublicShareFilesById(shareId, eduApiToken);
  }, [shareId, eduApiToken]);

  const onSubmit = () => {
    setIsShareFileDeleteDialogOpen(false);
    closeDialog();
  };

  const handleClose = () => closeDialog();

  const getDialogBody = () => {
    if (isLoading) return <CircleLoader className="mx-auto mt-5" />;
    return (
      <div className="text-background">
        <p>{publicShareFile?.creator}</p>
        <p>{publicShareFile?.creator}</p>
        <p>{publicShareFile?.creator}</p>
        <p>{publicShareFile?.creator}</p>
      </div>
    );
  };

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleClose}
      handleSubmit={onSubmit}
      submitButtonText="common.delete"
    />
  );

  return (
    <AdaptiveDialog
      isOpen={openShareInfoDialog}
      trigger={trigger}
      handleOpenChange={handleClose}
      title={t('filesharing.publicFileSharing.deleteDialogTitle')}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default DownloadPublicFileDialog;
