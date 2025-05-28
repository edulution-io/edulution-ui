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

import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { t } from 'i18next';
import React from 'react';
import MoveContentDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/MoveContentDialogBody';
import ShareCollectDialogProps from '@libs/classManagement/types/shareCollectDialogProps';
import useUserPath from '@/pages/FileSharing/hooks/useUserPath';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';

const ShareFilesDialog: React.FC<ShareCollectDialogProps> = ({ title, isOpen, onClose, action }) => {
  const { homePath } = useUserPath();
  const { moveOrCopyItemToPath } = useFileSharingDialogStore();

  const getDialogBody = () => (
    <MoveContentDialogBody
      showAllFiles
      pathToFetch={homePath}
    />
  );

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={onClose}
      handleSubmit={action}
      submitButtonText={`classmanagement.${title}`}
      disableSubmit={moveOrCopyItemToPath?.filePath === undefined}
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={onClose}
      title={t(`classmanagement.${title}`)}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default ShareFilesDialog;
