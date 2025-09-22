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
import { ColumnDef, OnChangeFn, Row, RowSelectionState } from '@tanstack/react-table';
import { Form } from '@/components/ui/Form';
import FormField from '@/components/shared/FormField';
import DirectoryBreadcrumb from '@/pages/FileSharing/Table/DirectoryBreadcrumb';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import HorizontalLoader from '@/components/ui/Loading/HorizontalLoader';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import useFileSharingMoveDialogStore from '@/pages/FileSharing/useFileSharingMoveDialogStore';
import getFileSharingTableColumns from '@/pages/FileSharing/Table/getFileSharingTableColumns';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import FILESHARING_TABLE_COLUM_NAMES from '@libs/filesharing/constants/filesharingTableColumNames';
import APPS from '@libs/appconfig/constants/apps';
import ContentType from '@libs/filesharing/types/contentType';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import { UseFormReturn } from 'react-hook-form';
import { SaveExternalFileFormValues } from '@libs/filesharing/types/saveExternalFileFormSchema';

interface SaveExternalFileDialogBodyProps {
  form: UseFormReturn<SaveExternalFileFormValues>;
}

const SaveExternalFileDialogBody: React.FC<SaveExternalFileDialogBodyProps> = ({ form }) => {
  const { t } = useTranslation();

  const { setMoveOrCopyItemToPath, moveOrCopyItemToPath } = useFileSharingDialogStore();
  const { fetchDialogDirs, dialogShownDirs, isLoading } = useFileSharingMoveDialogStore();
  const { currentPath, setCurrentPath } = useFileSharingStore();

  const currentDirItem: DirectoryFileDTO = useMemo(
    () => ({
      filePath: currentPath,
      etag: '',
      filename: currentPath.split('/').pop() || '',
      type: ContentType.DIRECTORY,
    }),
    [currentPath],
  );

  useEffect(() => {
    void fetchDialogDirs(currentPath);
  }, [currentPath, fetchDialogDirs]);

  useEffect(() => {
    setMoveOrCopyItemToPath(currentDirItem);
  }, [currentDirItem, setMoveOrCopyItemToPath]);

  const visibleColumns = [FILESHARING_TABLE_COLUM_NAMES.SELECT_FILENAME];

  const handleDirectoryRowClick = (row: Row<DirectoryFileDTO>) => {
    if (row.original.type === ContentType.DIRECTORY) {
      let newDirectoryPath = row.original.filePath;
      if (!newDirectoryPath.endsWith('/')) {
        newDirectoryPath += '/';
      }
      setCurrentPath(newDirectoryPath);
    }
  };

  const columns: ColumnDef<DirectoryFileDTO>[] = getFileSharingTableColumns(visibleColumns, handleDirectoryRowClick);

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updatedOrNewRowSelectionState) => {
    const rowSelectionState =
      typeof updatedOrNewRowSelectionState === 'function'
        ? updatedOrNewRowSelectionState({})
        : updatedOrNewRowSelectionState;

    const filePathToDirectoryFileMap = new Map(
      dialogShownDirs.map((directoryFile) => [directoryFile.filePath, directoryFile]),
    );

    const selectedDirectoryFiles = Object.keys(rowSelectionState)
      .filter((rowKey) => rowSelectionState[rowKey])
      .map((rowKey) => filePathToDirectoryFileMap.get(rowKey))
      .filter((directoryFile): directoryFile is DirectoryFileDTO => Boolean(directoryFile));

    const firstSelectedDirectoryFile: DirectoryFileDTO | undefined = selectedDirectoryFiles[0];

    if (firstSelectedDirectoryFile) {
      setMoveOrCopyItemToPath(firstSelectedDirectoryFile);
    } else {
      setMoveOrCopyItemToPath(currentDirItem);
    }
  };

  const handleBreadcrumbNavigate = (path: string) => {
    const newPath = getPathWithoutWebdav(path);
    setCurrentPath(newPath);
  };

  const footer = (
    <div className="bottom-0 justify-between bg-secondary p-4 text-sm text-foreground">
      <p className="bg-secondary">
        {t('saveExternalFileDialogBody.destinationFolder')}:{' '}
        <strong>
          {getPathWithoutWebdav(decodeURIComponent(moveOrCopyItemToPath?.filePath || currentPath || '/'))}
        </strong>
      </p>
    </div>
  );

  return (
    <>
      <div className="h-[46vh] flex-col overflow-auto text-background scrollbar-thin">
        <div className="pb-2">
          <DirectoryBreadcrumb
            path={currentPath}
            onNavigate={handleBreadcrumbNavigate}
            showHome
            showTitle={false}
          />
        </div>

        <div className="w-full">
          {isLoading ? (
            <HorizontalLoader className="w-[99%]" />
          ) : (
            <ScrollableTable
              columns={columns}
              data={dialogShownDirs}
              selectedRows={moveOrCopyItemToPath ? { [moveOrCopyItemToPath.filePath]: true } : {}}
              onRowSelectionChange={handleRowSelectionChange}
              applicationName={APPS.FILE_SHARING}
              getRowId={(row) => row.filePath}
              showHeader={false}
              textColorClassname="text-background"
              showSelectedCount={false}
              filterKey="select-filename"
              filterPlaceHolderText="filesharing.filterPlaceHolderText"
              isDialog
            />
          )}
        </div>
      </div>

      <div className="mt-4">
        <Form {...form}>
          <FormField
            name="filename"
            form={form}
            labelTranslationId="saveExternalFileDialogBody.filename"
            variant="dialog"
            placeholder={t('saveExternalFileDialogBody.filenamePlaceholder')}
          />
        </Form>
      </div>

      {footer}
    </>
  );
};

export default SaveExternalFileDialogBody;
