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
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useVariableSharePathname from '@/pages/FileSharing/hooks/useVariableSharePathname';

const ShareFilesDialog: React.FC<ShareCollectDialogProps> = ({ title, isOpen, onClose, action }) => {
  const { moveOrCopyItemToPath } = useFileSharingDialogStore();
  const { webdavShares } = useFileSharingStore();
  const { createVariableSharePathname } = useVariableSharePathname();

  const rootShares = webdavShares.filter((share) => share.isRootPath);
  const pathToFetch =
    rootShares.length > 0 ? createVariableSharePathname(rootShares[0].pathname, rootShares[0].variable) : '/';

  const getDialogBody = () =>
    rootShares.length === 0 ? (
      <p>{t('webdavShare.isRootPath.notConfigured')}</p>
    ) : (
      <MoveContentDialogBody
        showAllFiles
        pathToFetch={pathToFetch}
        showRootOnly
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
