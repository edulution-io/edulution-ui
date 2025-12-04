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
import { useTranslation } from 'react-i18next';
import getPublicShareTableColumns from '@/pages/FileSharing/publicShare/table/getPublicShareTableColumns';
import PUBLIC_SHARED_FILES_TABLE_COLUMN from '@libs/filesharing/constants/publicSharedFilesTableColumn';
import APPS from '@libs/appconfig/constants/apps';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useMedia from '@/hooks/useMedia';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import PUBLIC_SHARE_DIALOG_NAMES from '@libs/filesharing/constants/publicShareDialogNames';
import STANDARD_ACTION_TYPES from '@libs/common/constants/standardActionTypes';
import { TableActionsConfig } from '@libs/common/types/tableActionsConfig';
import PublicShareDto from '@libs/filesharing/types/publicShareDto';
import useTableActions from '@/hooks/useTableActions';

const PublicShareContentsDialogBody = () => {
  const { t } = useTranslation();
  const { isLoading, shares, setSelectedShares, selectedShares, openDialog } = usePublicShareStore();
  const { selectedItems, selectedRows } = useFileSharingStore();
  const { isMobileView, isTabletView } = useMedia();

  const currentFile = selectedItems[0];

  const shouldHideColumns = isMobileView || isTabletView;

  useEffect(() => {
    const sharesForCurrentFile = shares.filter((file) => file.filename === currentFile?.filename);
    setSelectedShares(sharesForCurrentFile);
  }, [shares]);

  const initialColumnVisibility = useMemo(
    () => ({
      [PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_CREATED_AT]: !shouldHideColumns,
      [PUBLIC_SHARED_FILES_TABLE_COLUMN.IS_PASSWORD_PROTECTED]: !shouldHideColumns,
      [PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_IS_ACCESSIBLE_BY]: !shouldHideColumns,
      [PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_NAME]: false,
    }),
    [shouldHideColumns],
  );

  const actionsConfig = useMemo<TableActionsConfig<PublicShareDto>>(
    () => [
      {
        type: STANDARD_ACTION_TYPES.ADD,
        onClick: () => openDialog(PUBLIC_SHARE_DIALOG_NAMES.CREATE_LINK),
      },
    ],
    [openDialog],
  );

  const actions = useTableActions(actionsConfig, []);

  return (
    <>
      <p>
        {t('filesharing.publicFileSharing.selectedFile')}{' '}
        {(selectedItems?.[0]?.filename ?? selectedShares?.[0]?.filename) || ''}
      </p>
      <ScrollableTable
        columns={getPublicShareTableColumns(true)}
        data={selectedShares}
        filterKey={PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_NAME}
        filterPlaceHolderText={t('fileSharing.filterPlaceHolderText')}
        isLoading={false}
        isDialog
        selectedRows={selectedRows}
        getRowId={({ publicShareId }) => publicShareId}
        applicationName={APPS.FILE_SHARING}
        initialColumnVisibility={initialColumnVisibility}
        showSearchBarAndColumnSelect={false}
        actions={actions}
      />

      {isLoading && <LoadingIndicatorDialog isOpen />}
    </>
  );
};

export default PublicShareContentsDialogBody;
