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

import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/shared/Button';
import { ArrowRightIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/ScrollArea';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import DirectoryBreadcrumb from '@/pages/FileSharing/Table/DirectoryBreadcrumb';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import ContentType from '@libs/filesharing/types/contentType';
import useLmnApiStore from '@/store/useLmnApiStore';

interface MoveContentDialogBodyProps {
  showAllFiles?: boolean;
  pathToFetch?: string;
  showSelectedFile?: boolean;
  showHome?: boolean;
}

const MoveContentDialogBody: React.FC<MoveContentDialogBodyProps> = ({
  showAllFiles = false,
  pathToFetch,
  showSelectedFile = true,
  showHome = true,
}) => {
  const { t } = useTranslation();
  const [currentPath, setCurrentPath] = useState(pathToFetch || '');
  const { setMoveOrCopyItemToPath, moveOrCopyItemToPath } = useFileSharingDialogStore();
  const { fetchDirs, fetchFiles, directories, files } = useFileSharingStore();
  const { user } = useLmnApiStore();

  useEffect(() => {
    if (showAllFiles && !pathToFetch) {
      void fetchFiles(currentPath);
    }
    if (pathToFetch && showAllFiles) {
      if (currentPath.includes(pathToFetch)) {
        void fetchFiles(currentPath);
      } else {
        void fetchFiles(pathToFetch);
      }
    } else {
      void fetchDirs(currentPath);
    }
  }, [currentPath]);

  const handleBreadcrumbNavigate = (path: string) => {
    setCurrentPath(path);
  };

  const handleNextFolder = (nextItem: DirectoryFileDTO) => {
    if (nextItem.type === ContentType.DIRECTORY) {
      let newCurrentPath = currentPath;
      if (!newCurrentPath.endsWith('/')) {
        newCurrentPath += '/';
      }
      if (newCurrentPath === '/') {
        newCurrentPath += nextItem.filename.replace('/webdav/', '').replace(`server/${user?.school}/`, '');
      } else {
        newCurrentPath += nextItem.basename;
      }
      setCurrentPath(newCurrentPath);
    }
  };

  const getHiddenSegments = (): string[] => {
    const segements = pathToFetch?.split('/');
    const index = segements?.findIndex((segment) => segment === segements.at(segment.length));
    return segements?.slice(0, index) || [];
  };

  const renderTableRow = (row: DirectoryFileDTO) => (
    <TableRow
      key={row.filename}
      onClick={(e) => {
        e.preventDefault();
        setMoveOrCopyItemToPath(row);
      }}
      onDoubleClick={(event) => {
        event.stopPropagation();
        handleNextFolder(row);
      }}
    >
      <TableCell
        className={`${
          moveOrCopyItemToPath.basename === row.basename ? 'bg-ciLightBlue' : ''
        } max-w-[150px] overflow-hidden truncate whitespace-nowrap text-background`}
      >
        <div className="flex w-full items-center justify-between text-ellipsis">
          <div>{row.basename}</div>
          <Button onClick={() => handleNextFolder(row)}>
            <ArrowRightIcon />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  const renderTable = () => (
    <ScrollArea className="h-[200px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-background">{t('moveItemDialog.folderName')}</TableHead>
          </TableRow>
        </TableHeader>
        {showAllFiles ? (
          <TableBody>{files.map(renderTableRow)}</TableBody>
        ) : (
          <TableBody>{directories.map(renderTableRow)}</TableBody>
        )}
      </Table>
    </ScrollArea>
  );

  return (
    <>
      <DirectoryBreadcrumb
        path={currentPath}
        onNavigate={handleBreadcrumbNavigate}
        showHome={showHome}
        hiddenSegments={getHiddenSegments()}
      />
      <ScrollArea className="h-[200px]">{renderTable()}</ScrollArea>
      {moveOrCopyItemToPath && showSelectedFile && (
        <p className="pt-10 text-background">
          {t('moveItemDialog.selectedItem')}: {decodeURIComponent(moveOrCopyItemToPath.filename)}
        </p>
      )}
    </>
  );
};

export default MoveContentDialogBody;
