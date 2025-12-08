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

import React, { useEffect, useMemo } from 'react';
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import getPublicShareTableColumns from '@/pages/FileSharing/publicShare/table/getPublicShareTableColumns';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import APPS from '@libs/appconfig/constants/apps';
import PUBLIC_SHARED_FILES_TABLE_COLUMN from '@libs/filesharing/constants/publicSharedFilesTableColumn';
import useMedia from '@/hooks/useMedia';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';

const PublicShareTable = () => {
  const { shares, isLoading, fetchShares, setSelectedRows, selectedRows } = usePublicShareStore();
  const { setIsFilePreviewVisible, isFilePreviewDocked } = useFileEditorStore();

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue = typeof updaterOrValue === 'function' ? updaterOrValue(selectedRows) : updaterOrValue;
    setSelectedRows(newValue);
  };

  useEffect(() => {
    if (isFilePreviewDocked) {
      setIsFilePreviewVisible(false);
    }

    void fetchShares();
  }, []);

  const { isMobileView, isTabletView } = useMedia();

  const initialColumnVisibility = useMemo(
    () => ({
      [PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_VALID_UNTIL]: !isMobileView,
      [PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_IS_ACCESSIBLE_BY]: !isMobileView,
      [PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_CREATED_AT]: !(isMobileView || isTabletView),
      [PUBLIC_SHARED_FILES_TABLE_COLUMN.IS_PASSWORD_PROTECTED]: !(isMobileView || isTabletView),
    }),
    [isMobileView, isTabletView],
  );

  return (
    <ScrollableTable
      columns={getPublicShareTableColumns(false)}
      data={shares}
      filterKey={PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_NAME}
      filterPlaceHolderText="filesharing.publicFileSharing.searchSharedFiles"
      onRowSelectionChange={handleRowSelectionChange}
      isLoading={isLoading}
      selectedRows={selectedRows}
      getRowId={({ publicShareId }) => publicShareId}
      applicationName={APPS.FILE_SHARING}
      initialColumnVisibility={initialColumnVisibility}
    />
  );
};

export default PublicShareTable;
