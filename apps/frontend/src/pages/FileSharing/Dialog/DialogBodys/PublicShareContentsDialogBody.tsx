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

import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import getPublicShareTableColumns from '@/pages/FileSharing/publicShare/table/getPublicShareTableColumns';
import PUBLIC_SHARED_FILES_TABLE_COLUMN from '@libs/filesharing/constants/publicSharedFilesTableColumn';
import APPS from '@libs/appconfig/constants/apps';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import { IoAdd } from 'react-icons/io5';
import useMedia from '@/hooks/useMedia';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import PUBLIC_SHARE_DIALOG_NAMES from '@libs/filesharing/constants/publicShareDialogNames';

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
        actions={[
          {
            icon: IoAdd,
            translationId: 'common.add',
            onClick: () => openDialog(PUBLIC_SHARE_DIALOG_NAMES.CREATE_LINK),
          },
        ]}
      />

      {isLoading && <LoadingIndicatorDialog isOpen />}
    </>
  );
};

export default PublicShareContentsDialogBody;
