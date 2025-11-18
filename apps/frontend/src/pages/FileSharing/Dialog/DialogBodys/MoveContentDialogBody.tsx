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

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import DirectoryBreadcrumb from '@/pages/FileSharing/Table/DirectoryBreadcrumb';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import APPS from '@libs/appconfig/constants/apps';
import { ColumnDef, OnChangeFn, Row, RowSelectionState } from '@tanstack/react-table';
import FILESHARING_TABLE_COLUM_NAMES from '@libs/filesharing/constants/filesharingTableColumNames';
import type MoveContentDialogBodyProps from '@libs/filesharing/types/moveContentDialogBodyProps';
import ContentType from '@libs/filesharing/types/contentType';
import useFileSharingMoveDialogStore from '@/pages/FileSharing/useFileSharingMoveDialogStore';
import getFileSharingTableColumns from '@/pages/FileSharing/Table/getFileSharingTableColumns';
import HorizontalLoader from '@/components/ui/Loading/HorizontalLoader';
import Input from '@/components/shared/Input';
import useDeploymentTarget from '@/hooks/useDeploymentTarget';
import WebdavShareSelectDropdown from './WebdavShareSelectDropdown';
import useFileSharingStore from '../../useFileSharingStore';
import useVariableSharePathname from '../../hooks/useVariableSharePathname';

const MoveContentDialogBody: React.FC<MoveContentDialogBodyProps> = ({
  showAllFiles = false,
  pathToFetch,
  showSelectedFile = true,
  showHome = true,
  fileType,
  isCurrentPathDefaultDestination = false,
  enableRowSelection,
  getRowDisabled,
  showRootOnly = false,
}) => {
  const { webdavShare } = useParams();
  const { t } = useTranslation();
  const [currentPath, setCurrentPath] = useState(pathToFetch || '/');
  const { selectedWebdavShare, webdavShares } = useFileSharingStore();
  const { createVariableSharePathname } = useVariableSharePathname();
  const { setMoveOrCopyItemToPath, moveOrCopyItemToPath } = useFileSharingDialogStore();
  const { isLmn } = useDeploymentTarget();

  const { fetchDialogFiles, fetchDialogDirs, dialogShownDirs, dialogShownFiles, isLoading } =
    useFileSharingMoveDialogStore();

  const firstRender = useRef(true);

  const currentDirItem: DirectoryFileDTO = {
    filePath: currentPath,
    etag: '',
    filename: currentPath.split('/').pop() || '',
    type: ContentType.DIRECTORY,
  };

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const share = webdavShares.find((s) => s.displayName === selectedWebdavShare) || webdavShares[0];
    const newCurrentPath = createVariableSharePathname(share.pathname, share.pathVariables, isLmn);
    setCurrentPath(newCurrentPath);
  }, [selectedWebdavShare]);

  useEffect(() => {
    if (!selectedWebdavShare && !webdavShare) return;

    if (showAllFiles) {
      void fetchDialogFiles(selectedWebdavShare || webdavShare, currentPath);
    } else {
      void fetchDialogDirs(selectedWebdavShare || webdavShare, currentPath);
    }
  }, [webdavShare, selectedWebdavShare, currentPath, showAllFiles]);

  useEffect(() => {
    if (isCurrentPathDefaultDestination) {
      setMoveOrCopyItemToPath(currentDirItem);
    }
  }, [isCurrentPathDefaultDestination, currentPath, selectedWebdavShare]);

  const files = fileType === ContentType.DIRECTORY ? dialogShownDirs : dialogShownFiles;

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const selectionValue = typeof updaterOrValue === 'function' ? updaterOrValue({}) : updaterOrValue;

    const fileMap = new Map(files.map((file) => [file.filePath, file]));

    const selectedItems = Object.keys(selectionValue)
      .filter((key) => selectionValue[key])
      .map((key) => fileMap.get(key))
      .filter(Boolean) as DirectoryFileDTO[];

    setMoveOrCopyItemToPath(selectedItems[0]);
  };

  const onFilenameClick = (item: Row<DirectoryFileDTO>) => {
    if (item.original.type === ContentType.DIRECTORY) {
      const newPath = item.original.filePath;
      setCurrentPath(newPath);
    } else {
      item.toggleSelected();
    }
  };

  const handleBreadcrumbNavigate = (path: string) => {
    if (path === '/') {
      const currentShare = webdavShares.find((s) => s.displayName === selectedWebdavShare) ?? webdavShares[0];

      let currentSharePath = currentShare.pathname;
      if (currentShare.pathVariables) {
        currentSharePath = createVariableSharePathname(currentSharePath, currentShare.pathVariables, isLmn);
      }

      setCurrentPath(currentSharePath);
    } else {
      setCurrentPath(path);
    }
  };

  const getHiddenSegments = () =>
    webdavShares.find((s) => s.displayName === (selectedWebdavShare || webdavShare))?.pathname;

  const selectedInputValue =
    moveOrCopyItemToPath?.filename && showSelectedFile
      ? `${t('moveItemDialog.selectedItem')}: ${decodeURIComponent(moveOrCopyItemToPath.filename)}`
      : t('filesharing.selectFile');

  const footer = (
    <Input
      title={t('moveItemDialog.selectedItem')}
      value={selectedInputValue}
      variant="dialog"
      className="h-10"
    />
  );

  const visibleColumns = [FILESHARING_TABLE_COLUM_NAMES.SELECT_FILENAME];
  const columns: ColumnDef<DirectoryFileDTO>[] = getFileSharingTableColumns(visibleColumns, onFilenameClick);

  return (
    <>
      <WebdavShareSelectDropdown
        webdavShare={webdavShare}
        showRootOnly={showRootOnly}
      />
      <div className="text-background">
        <div className="pb-2">
          <DirectoryBreadcrumb
            path={currentPath}
            onNavigate={handleBreadcrumbNavigate}
            showHome={showHome}
            hiddenSegments={getHiddenSegments()}
            showTitle={false}
          />
        </div>
        <div className="w-full">{isLoading ? <HorizontalLoader className="w-[99%]" /> : <div className="h-1" />}</div>
        <div className="h-[45vh] max-h-[45vh] overflow-auto scrollbar-thin">
          <ScrollableTable
            columns={columns}
            data={files}
            selectedRows={moveOrCopyItemToPath ? { [moveOrCopyItemToPath.filePath]: true } : {}}
            onRowSelectionChange={handleRowSelectionChange}
            applicationName={APPS.FILE_SHARING}
            getRowId={(row) => row.filePath}
            showHeader={false}
            textColorClassname="text-background"
            showSelectedCount={false}
            filterKey="select-filename"
            filterPlaceHolderText="filesharing.filterPlaceHolderText"
            enableRowSelection={enableRowSelection}
            getRowDisabled={getRowDisabled}
            isDialog
          />
        </div>
      </div>
      <div className="pt-2">{footer}</div>
    </>
  );
};

export default MoveContentDialogBody;
