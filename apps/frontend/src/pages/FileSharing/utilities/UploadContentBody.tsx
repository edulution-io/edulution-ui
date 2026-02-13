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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@edulution-io/ui-kit';
import { useTranslation } from 'react-i18next';
import { bytesToMegabytes } from '@/pages/FileSharing/utilities/filesharingUtilities';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import { ScrollArea } from '@/components/ui/ScrollArea';
import FileTypeIcon from '@/pages/FileSharing/utilities/FileTypeIcon';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import { UploadItem } from '@libs/filesharing/types/uploadItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faFileCirclePlus, faFolder, faFolderPlus } from '@fortawesome/free-solid-svg-icons';
import getFileUploadLimit from '@libs/ui/utils/getFileUploadLimit';
import useHandleUploadFileStore from '@/pages/FileSharing/Dialog/upload/useHandleUploadFileStore';
import ActionTooltip from '@/components/shared/ActionTooltip';
import isFolderUploadItem from '@libs/filesharing/utils/isFolderUploadItem';
import createFolderUploadItem from '@libs/filesharing/utils/createFolderUploadItem';
import splitFilesByMaxFileSize from '@libs/filesharing/utils/splitFilesByMaxFileSize';
import findDuplicateFiles from '@libs/filesharing/utils/findDuplicateFiles';
import getUploadItemDisplayName from '@libs/filesharing/utils/getUploadItemDisplayName';
import extractFilesFromDropEvent from '@/pages/FileSharing/utilities/extractFilesFromDropEvent';
import ValidationWarnings from '@/pages/FileSharing/utilities/ValidationWarnings';
import getRandomUUID from '@/utils/getRandomUUID';
import DropZone from '@/components/ui/DropZone';
import DeleteButton from '@/components/shared/Card/DeleteButton';

const UploadContentBody = () => {
  const { webdavShare } = useParams();
  const { t } = useTranslation();
  const { files, webdavShares } = useFileSharingStore();
  const [oversizedFiles, setOversizedFiles] = useState<File[]>([]);
  const [tooLargeFolders, setTooLargeFolders] = useState<string[]>([]);
  const { setSubmitButtonIsDisabled } = useFileSharingDialogStore();
  const [filesThatWillBeOverwritten, setFilesThatWillBeOverwritten] = useState<string[]>([]);
  const [foldersThatWillBeOverwritten, setFoldersThatWillBeOverwritten] = useState<string[]>([]);

  const { filesToUpload, updateFilesToUpload } = useHandleUploadFileStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: (File | UploadItem)[]) => {
      const folders = acceptedFiles.filter((file): file is UploadItem => isFolderUploadItem(file as UploadItem));
      const regularFiles = acceptedFiles.filter((file) => !isFolderUploadItem(file as UploadItem)) as File[];
      const { oversize, normal } = splitFilesByMaxFileSize(regularFiles, getFileUploadLimit(webdavShares, webdavShare));
      const duplicates = findDuplicateFiles(
        [...normal, ...folders].map((file) => Object.assign(file, { id: getRandomUUID() })),
        files,
      );

      setOversizedFiles((prev) => [
        ...prev,
        ...oversize.filter((file) => !prev.some((prevFile) => prevFile.name === file.name)),
      ]);

      const duplicateFolders = duplicates.filter((d) => d.isFolder);
      const duplicateFiles = duplicates.filter((d) => !d.isFolder);

      setFilesThatWillBeOverwritten((prev) => {
        const seen = new Set(prev);
        const fresh = duplicateFiles.map((d) => d.name).filter((k) => !seen.has(k));
        return [...prev, ...fresh];
      });

      setFoldersThatWillBeOverwritten((prev) => {
        const seen = new Set(prev);
        const fresh = duplicateFolders.map((d) => d.name).filter((k) => !seen.has(k));
        return [...prev, ...fresh];
      });

      updateFilesToUpload((prevFiles) => {
        const existingNames = new Set(prevFiles.map((f) => getUploadItemDisplayName(f)));
        const newUploadFiles = [...normal, ...folders]
          .filter((file) => !existingNames.has(getUploadItemDisplayName(file)))
          .map((file) => {
            if (isFolderUploadItem(file as UploadItem)) {
              return file as UploadItem;
            }
            const uploadFile: UploadItem = Object.assign(new File([file], file.name, { type: file.type }), {
              id: getRandomUUID(),
            });
            return uploadFile;
          });

        return [...prevFiles, ...newUploadFiles];
      });
    },
    [files, webdavShares, webdavShare, updateFilesToUpload],
  );

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    onDrop(selected);
    e.target.value = '';
  };

  const handleFolderSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);

    if (selected.length > 0) {
      const firstFile = selected[0];
      const pathParts = firstFile.webkitRelativePath?.split('/') || [];
      const folderName = pathParts[0] || 'folder';
      const folderEntry = createFolderUploadItem(folderName, selected, getRandomUUID());
      onDrop([folderEntry]);
    }
    e.target.value = '';
  };

  const toggleHiddenFilesForFolder = (folderId: string) => {
    const maxSizeMB = getFileUploadLimit(webdavShares, webdavShare);

    updateFilesToUpload((prev) =>
      prev.map((file) => {
        if (file.id !== folderId || !isFolderUploadItem(file)) {
          return file;
        }

        const includeHidden = !file.includeHidden;
        const baseFiles = file.visibleFiles || [];
        const hiddenSystemFiles = file.hiddenFiles || [];
        const newFiles = includeHidden ? [...baseFiles, ...hiddenSystemFiles] : baseFiles;

        const newTotalSize = newFiles.reduce((sum, f) => sum + f.size, 0);
        const newSizeMB = bytesToMegabytes(newTotalSize);

        if (newSizeMB > maxSizeMB) {
          setTooLargeFolders((prevFolders) => [...new Set([...prevFolders, file.folderName])]);
          return file;
        }

        setTooLargeFolders((prevFolders) => prevFolders.filter((name) => name !== file.folderName));

        return {
          ...file,
          includeHidden,
          files: newFiles,
        } as UploadItem;
      }),
    );
  };

  const removeFile = (identifier: string) => {
    updateFilesToUpload((prev) =>
      prev.filter((file) => {
        const name = getUploadItemDisplayName(file);
        return name !== identifier;
      }),
    );
    setOversizedFiles((prev) => prev.filter((f) => f.name !== identifier));
    setFilesThatWillBeOverwritten((prev) => prev.filter((k) => k !== identifier));
    setFoldersThatWillBeOverwritten((prev) => prev.filter((k) => k !== identifier));
    setTooLargeFolders((prev) => prev.filter((k) => k !== identifier));
  };

  useEffect(() => {
    setSubmitButtonIsDisabled(oversizedFiles.length !== 0 || tooLargeFolders.length !== 0);
  }, [oversizedFiles, tooLargeFolders, setSubmitButtonIsDisabled]);

  const renderPreview = (file: UploadItem) => {
    if (isFolderUploadItem(file)) {
      return (
        <div className="flex h-20 items-center justify-center">
          <FontAwesomeIcon
            icon={faFolder}
            size="2xl"
            className="text-yellow-500"
          />
        </div>
      );
    }

    if (file.type.startsWith('image/')) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt={t('filesharingUpload.previewAlt', { filename: file.name })}
          className="mb-2 aspect-square h-auto w-full object-cover"
          onLoad={() => URL.revokeObjectURL(file.name)}
        />
      );
    }

    return (
      <div className="flex h-20 items-center justify-center">
        <FileTypeIcon
          size={40}
          filename={file.name}
        />
      </div>
    );
  };

  return (
    <form className="overflow-auto">
      <DropZone
        onDrop={onDrop}
        getFilesFromEvent={extractFilesFromDropEvent}
        dragActiveText={t('filesharingUpload.dropHere')}
        inactiveText={t('filesharingUpload.dragDropClick')}
        className="mb-4 p-10"
        minHeight="min-h-48"
      />

      <input
        type="file"
        multiple
        hidden
        ref={fileInputRef}
        onChange={handleFilesSelected}
      />

      <input
        type="file"
        hidden
        ref={folderInputRef}
        webkitdirectory=""
        onChange={handleFolderSelected}
      />

      <div className="flex w-full gap-2 pb-8">
        <Button
          variant="btn-collaboration"
          className="flex-1"
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center">
            <FontAwesomeIcon icon={faFileCirclePlus} />
            {t('filesharingUpload.addFiles')}
          </div>
        </Button>

        <Button
          variant="btn-collaboration"
          className="flex-1"
          type="button"
          onClick={() => folderInputRef.current?.click()}
        >
          <div className="flex flex-col items-center">
            <div>
              <FontAwesomeIcon icon={faFolderPlus} />
            </div>
            {t('filesharingUpload.addFolder')}
          </div>
        </Button>
      </div>

      <ValidationWarnings
        oversizedFiles={oversizedFiles}
        duplicateFiles={filesThatWillBeOverwritten}
        duplicateFolders={foldersThatWillBeOverwritten}
        tooLargeFolders={tooLargeFolders}
      />

      {filesToUpload.length > 0 && (
        <ScrollArea className="mt-2 max-h-[50vh] overflow-y-auto overflow-x-hidden rounded-xl border border-gray-600 px-2 scrollbar-thin">
          <ul className="my-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {filesToUpload.map((file) => {
              const isFolder = isFolderUploadItem(file);
              const fileName = getUploadItemDisplayName(file);

              const totalSize = isFolder && file.files ? file.files.reduce((sum, f) => sum + f.size, 0) : file.size;

              const isOversized = bytesToMegabytes(totalSize) > getFileUploadLimit(webdavShares, webdavShare);

              let baseBorderClass = 'border-accent';
              if (isOversized) {
                baseBorderClass = 'border-ciRed opacity-50';
              }

              return (
                <li
                  key={file.id}
                  className={`group relative overflow-hidden rounded-xl border p-2 shadow-lg transition-all duration-200 hover:min-h-[80px] hover:overflow-visible ${baseBorderClass}`}
                >
                  {renderPreview(file)}

                  <DeleteButton onDelete={() => removeFile(fileName)} />

                  <div className="flex flex-col items-center justify-center">
                    <div className="truncate text-center text-xs text-neutral-500 underline transition-all duration-200 group-hover:min-w-full group-hover:overflow-visible group-hover:whitespace-normal group-hover:break-words group-hover:p-1">
                      {fileName}
                    </div>
                    {isFolder && (
                      <div className="text-center text-xs text-neutral-400">
                        {file.files?.length || 0}{' '}
                        {(file.files?.length || 0) === 1 ? t('filesharingUpload.file') : t('filesharingUpload.files')}
                      </div>
                    )}
                  </div>
                  {isFolder && file.hiddenFiles && file.hiddenFiles.length > 0 && (
                    <div className="flex items-center justify-center gap-1 pt-1">
                      <ActionTooltip
                        tooltipText={t('filesharingUpload.hiddenFiles')}
                        trigger={
                          <label
                            htmlFor={`hidden-${file.id}`}
                            className="mt-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-neutral-700 px-2 py-1 text-xs text-neutral-300 hover:bg-neutral-600"
                          >
                            <input
                              type="checkbox"
                              id={`hidden-${file.id}`}
                              checked={file.includeHidden || false}
                              onChange={() => toggleHiddenFilesForFolder(file.id)}
                              className="h-3 w-3 rounded border-gray-300"
                            />
                            <FontAwesomeIcon
                              icon={faEye}
                              className="h-3 w-3"
                            />
                            <span>+{file.hiddenFiles.length}</span>
                          </label>
                        }
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      )}
    </form>
  );
};

export default UploadContentBody;
