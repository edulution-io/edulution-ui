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

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PublicShareFilesTableColumns from '@/pages/FileSharing/publicShareFiles/table/PublicShareFilesTableColums';
import PUBLIC_SHARED_FILES_TABLE_COLUMN from '@libs/filesharing/constants/publicSharedFIlesTableColum';
import APPS from '@libs/appconfig/constants/apps';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import { usePublicShareFilesStore } from '@/pages/FileSharing/publicShareFiles/usePublicShareFilesStore';
import { Button } from '@/components/shared/Button';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';

const ShareFileLinkDialogBody = () => {
  const { t } = useTranslation();
  const { editMultipleFiles, isLoading, selectedRows, setIsCreateNewFileLinkDialogOpen } = usePublicShareFilesStore();
  const { selectedItems } = useFileSharingStore();
  const { closeDialog } = useFileSharingDialogStore();

  const initialColumnVisibility = useMemo(
    () => ({
      [PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_NAME]: false,
    }),
    [selectedRows],
  );

  return (
    <div className="flex flex-col gap-4">
      <p>
        {t('filesharing.publicFileSharing.selectedFile')}{' '}
        {(selectedItems?.[0]?.filename ?? editMultipleFiles?.[0]?.filename) || ''}
      </p>
      <ScrollableTable
        columns={PublicShareFilesTableColumns}
        data={editMultipleFiles}
        filterKey={PUBLIC_SHARED_FILES_TABLE_COLUMN.FILE_NAME}
        filterPlaceHolderText={t('fileSharing.filterPlaceHolderText')}
        isLoading={isLoading}
        selectedRows={selectedRows}
        getRowId={({ _id: id }) => id}
        applicationName={APPS.FILE_SHARING}
        initialColumnVisibility={initialColumnVisibility}
        showSearchBar={false}
      />
      <Button
        type="button"
        variant="btn-small"
        className="w-full justify-center bg-primary text-secondary"
        onClick={() => {
          closeDialog();
          setIsCreateNewFileLinkDialogOpen(true);
        }}
      >
        {t('filesharing.publicFileSharing.fileLink')}
      </Button>
    </div>
  );
};

export default ShareFileLinkDialogBody;
