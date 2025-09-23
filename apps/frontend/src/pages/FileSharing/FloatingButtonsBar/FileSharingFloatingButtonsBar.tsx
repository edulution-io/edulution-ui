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

import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import React from 'react';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import FileActionNonSelect from '@/pages/FileSharing/FloatingButtonsBar/FileActionNonSelect';
import FileActionMultiSelect from '@/pages/FileSharing/FloatingButtonsBar/FileActionMultiSelect';
import useQuotaInfo from '@/hooks/useQuotaInfo';
import QuotaThresholdPercent from '@libs/filesharing/constants/quotaThresholdPercent';
import FileActionOneSelect from '@/pages/FileSharing/FloatingButtonsBar/FileActionOneSelect';

const FileSharingFloatingButtonsBar = () => {
  const { openDialog } = useFileSharingDialogStore();
  const { selectedItems } = useFileSharingStore();
  const { percentageUsed } = useQuotaInfo();
  const showFileActionNonSelect = selectedItems.length === 0 && percentageUsed < QuotaThresholdPercent.CRITICAL;
  return (
    <>
      {showFileActionNonSelect && <FileActionNonSelect openDialog={openDialog} />}

      {selectedItems.length === 1 && (
        <FileActionOneSelect
          openDialog={openDialog}
          selectedItems={selectedItems}
        />
      )}
      {selectedItems.length > 1 && (
        <FileActionMultiSelect
          openDialog={openDialog}
          selectedItems={selectedItems}
        />
      )}
    </>
  );
};

export default FileSharingFloatingButtonsBar;
