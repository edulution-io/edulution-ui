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
import PublicShareFilesTableColumns from '@/pages/FileSharing/publicShare/table/PublicShareTableColums';
import PUBLIC_SHARED_FILES_TABLE_COLUMN from '@libs/filesharing/constants/publicSharedFIlesTableColum';
import APPS from '@libs/appconfig/constants/apps';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import { IoAdd } from 'react-icons/io5';
import useMedia from '@/hooks/useMedia';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';

const PublicShareContentsDialogBody = () => {
  const { t } = useTranslation();
  const {
    contentsToShare,
    isLoading,
    setContentsToShare,
    selectedRows,
    setIsCreateNewPublicShareLinkDialogOpen,
    deletePublicShares,
    shares,
  } = usePublicShareStore();
  const { selectedItems } = useFileSharingStore();
  const { isMobileView, isTabletView } = useMedia();

  const currentFile = contentsToShare[0] ?? selectedItems[0];

  const shouldHideColumns = isMobileView || isTabletView;

  useEffect(() => {
    const sharesForCurrentFile = shares.filter((file) => file.filename === currentFile?.filename);
    setContentsToShare(sharesForCurrentFile);
  }, [shares]);

  const initialColumnVisibility = useMemo(
    () => ({
      [PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_CREATED_AT]: !shouldHideColumns,
      [PUBLIC_SHARED_FILES_TABLE_COLUMN.IS_PASSWORD_PROTECTED]: !shouldHideColumns,
      [PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_IS_ACCESSIBLE_BY]: !shouldHideColumns,
      [PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_NAME]: false,
    }),
    [selectedRows, deletePublicShares, isTabletView, isMobileView, shouldHideColumns],
  );

  return (
    <div className="scrollable relative flex w-full min-w-0 flex-col gap-4">
      <p>
        {t('filesharing.publicFileSharing.selectedFile')}{' '}
        {(selectedItems?.[0]?.filename ?? contentsToShare?.[0]?.filename) || ''}
      </p>
      <div className="max-h-[60vh] overflow-y-auto">
        <ScrollableTable
          columns={PublicShareFilesTableColumns}
          data={contentsToShare}
          filterKey={PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_NAME}
          filterPlaceHolderText={t('fileSharing.filterPlaceHolderText')}
          isLoading={false}
          selectedRows={selectedRows}
          getRowId={({ publicShareId }) => publicShareId}
          applicationName={APPS.FILE_SHARING}
          initialColumnVisibility={initialColumnVisibility}
          showSearchBarAndColumnSelect={false}
          actions={[
            {
              icon: IoAdd,
              translationId: 'common.add',
              onClick: () => setIsCreateNewPublicShareLinkDialogOpen(true),
            },
          ]}
        />
      </div>

      {isLoading && <LoadingIndicatorDialog isOpen />}
    </div>
  );
};

export default PublicShareContentsDialogBody;
