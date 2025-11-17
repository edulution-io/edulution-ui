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
