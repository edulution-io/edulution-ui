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
import { DropEvent, useDropzone } from 'react-dropzone';
import { MdOutlineCloudUpload } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/shared/Button';
import { useTranslation } from 'react-i18next';
import { HiExclamationTriangle, HiEyeSlash, HiTrash } from 'react-icons/hi2';
import { bytesToMegabytes } from '@/pages/FileSharing/utilities/filesharingUtilities';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import { ScrollArea } from '@/components/ui/ScrollArea';
import FileIconComponent from '@/pages/FileSharing/utilities/FileIconComponent';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import WarningBox from '@/components/shared/WarningBox';
import { TiDocumentAdd, TiFolderAdd } from 'react-icons/ti';
import { UploadFile } from '@libs/filesharing/types/uploadFile';
import { FcFolder } from 'react-icons/fc';
import getFileUploadLimit from '@libs/ui/utils/getFileUploadLimit';
import useHandelUploadFileStore from '@/pages/FileSharing/Dialog/upload/useHandelUploadFileStore';
import { v4 as uuidv4 } from 'uuid';
import isHiddenFile from '@libs/filesharing/utils/isHiddenFile';
import isSystemFile from '@libs/filesharing/utils/isSystemFile';
import ActionTooltip from '@/components/shared/ActionTooltip';
import { BUTTONS_ICON_WIDTH, SIDEBAR_ICON_WIDTH } from '@libs/ui/constants';

const UploadContentBody = () => {
  const { webdavShare } = useParams();
  const { t } = useTranslation();
  const { files, webdavShares } = useFileSharingStore();
  const [oversizedFiles, setOversizedFiles] = useState<File[]>([]);
  const [tooLargeFolders, setTooLargeFolders] = useState<string[]>([]);
  const { setSubmitButtonIsDisabled } = useFileSharingDialogStore();

  const [filesThatWillBeOverwritten, setFilesThatWillBeOverwritten] = useState<string[]>([]);

  const { filesToUpload, updateFilesToUpload } = useHandelUploadFileStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const hasMultipleDuplicates = filesThatWillBeOverwritten.length > 1;
  const hasMultipleOversizedFiles = oversizedFiles.length > 1;
  const isAnyFileOversized = oversizedFiles.length > 0;

  const isFolderUpload = (
    file: UploadFile,
  ): file is UploadFile & {
    isFolder: true;
    folderName: string;
    files: File[];
    fileCount: number;
    visibleFiles?: File[];
    hiddenFiles?: File[];
    includeHidden?: boolean;
  } => 'isFolder' in file && file.isFolder === true && 'folderName' in file && typeof file.folderName === 'string';

  const displayName = (file: UploadFile | { name: string }): string => {
    if ('isFolder' in file && isFolderUpload(file)) {
      return file.folderName || '';
    }
    return file.name;
  };

  const splitFilesByMaxFileSize = (incomingFiles: File[], maxSizeMB: number): { oversize: File[]; normal: File[] } => {
    const oversize = incomingFiles.filter((f) => bytesToMegabytes(f.size) > maxSizeMB);
    const normal = incomingFiles.filter((f) => bytesToMegabytes(f.size) <= maxSizeMB);
    return { oversize, normal };
  };

  const findDuplicateFiles = (incoming: UploadFile[], existing: { filename: string }[]): { name: string }[] => {
    const normalize = (filename: string) => decodeURIComponent(filename).trim().toLowerCase();
    const existingFilenameSet = new Set(existing.map((existingFile) => normalize(existingFile.filename)));

    return incoming
      .filter((file) => existingFilenameSet.has(normalize(displayName(file))))
      .map((file) => ({ name: displayName(file) }));
  };

  const duplicateKey = (f: UploadFile | { name: string }) => f.name;

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const folders = acceptedFiles.filter((file): file is UploadFile => isFolderUpload(file as UploadFile));
      const regularFiles = acceptedFiles.filter((file) => !isFolderUpload(file as UploadFile));

      const { oversize, normal } = splitFilesByMaxFileSize(regularFiles, getFileUploadLimit(webdavShares, webdavShare));

      const duplicates = findDuplicateFiles(
        [...normal, ...folders].map((file) => Object.assign(file, { id: uuidv4() })),
        files,
      );

      setOversizedFiles((prev) => [
        ...prev,
        ...oversize.filter((file) => !prev.some((prevFile) => prevFile.name === file.name)),
      ]);

      setFilesThatWillBeOverwritten((prev) => {
        const seen = new Set(prev);
        const fresh = duplicates.map(duplicateKey).filter((k) => !seen.has(k));
        return [...prev, ...fresh];
      });

      updateFilesToUpload((prevFiles) => {
        const existingNames = new Set(prevFiles.map((f) => displayName(f)));

        const newFiles = [...normal, ...folders]
          .filter((file) => !existingNames.has(displayName(file)))
          .map((file) => {
            if (isFolderUpload(file as UploadFile)) {
              return file as UploadFile;
            }
            const uploadFile: UploadFile = Object.assign(new File([file], file.name, { type: file.type }), {
              id: uuidv4(),
            });
            return uploadFile;
          });

        return [...prevFiles, ...newFiles];
      });
    },
    [files, webdavShares, webdavShare, updateFilesToUpload],
  );

  const extractFilesFromEvent = (event: DropEvent): Promise<File[]> => {
    if ('dataTransfer' in event && event.dataTransfer) {
      const items = Array.from(event.dataTransfer.items ?? []);

      return Promise.resolve(items.map((item) => item.getAsFile()).filter((file): file is File => file !== null));
    }

    if ('target' in event && (event.target as HTMLInputElement).files) {
      return Promise.resolve(Array.from((event.target as HTMLInputElement).files!));
    }

    return Promise.resolve([]);
  };

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

      const visibleFiles = selected.filter((file) => !isSystemFile(file.name) && !isHiddenFile(file.name));
      const hiddenAndSystemFiles = selected.filter((file) => isSystemFile(file.name) || isHiddenFile(file.name));

      const folderEntry: UploadFile = Object.assign(new File([], folderName, { type: 'application/x-directory' }), {
        id: uuidv4(),
        isFolder: true,
        folderName,
        files: visibleFiles,
        fileCount: visibleFiles.length,
        visibleFiles,
        hiddenFiles: hiddenAndSystemFiles,
        includeHidden: false,
      });

      onDrop([folderEntry]);
    }
    e.target.value = '';
  };

  const toggleHiddenFilesForFolder = (folderId: string) => {
    updateFilesToUpload((prev) =>
      prev.map((file) => {
        if (file.id !== folderId || !isFolderUpload(file)) {
          return file;
        }

        const includeHidden = !file.includeHidden;

        const baseFiles = file.visibleFiles || [];
        const hiddenSystemFiles = file.hiddenFiles || [];

        const newFiles = includeHidden ? [...baseFiles, ...hiddenSystemFiles] : baseFiles;

        return {
          ...file,
          includeHidden,
          files: newFiles,
          fileCount: newFiles.length,
        };
      }),
    );
  };

  const removeFile = (identifier: string) => {
    updateFilesToUpload((prev) =>
      prev.filter((file) => {
        const name = displayName(file);
        return name !== identifier;
      }),
    );
    setOversizedFiles((prev) => prev.filter((f) => f.name !== identifier));
    setFilesThatWillBeOverwritten((prev) => prev.filter((k) => k !== identifier));
    setTooLargeFolders((prev) => prev.filter((k) => k !== identifier));
  };

  useEffect(() => {
    setSubmitButtonIsDisabled(oversizedFiles.length !== 0 || tooLargeFolders.length !== 0);
  }, [oversizedFiles, tooLargeFolders, setSubmitButtonIsDisabled]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    getFilesFromEvent: (event) => extractFilesFromEvent(event),
    onDrop,
  });

  const renderPreview = (file: UploadFile) => {
    if (isFolderUpload(file)) {
      return (
        <div className="flex h-20 items-center justify-center">
          <FcFolder size={SIDEBAR_ICON_WIDTH} />
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
        <FileIconComponent
          size={Number(SIDEBAR_ICON_WIDTH)}
          filename={file.name}
        />
      </div>
    );
  };

  const dropzoneStyle = `border-2 border-dashed border-gray-300 rounded-md p-10 mb-4 ${
    isDragActive ? 'bg-foreground' : 'bg-popover-foreground'
  }`;

  return (
    <form className="overflow-auto">
      <div {...getRootProps({ className: dropzoneStyle })}>
        <input {...getInputProps()} />

        <div className="flex min-h-48 flex-col items-center justify-center space-y-2">
          <p className="text-center font-semibold text-secondary">
            {isDragActive ? t('filesharingUpload.dropHere') : t('filesharingUpload.dragDropClick')}
          </p>
          <MdOutlineCloudUpload className="h-12 w-12 text-muted" />
        </div>
      </div>

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
            <TiDocumentAdd size={BUTTONS_ICON_WIDTH} />
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
              <TiFolderAdd size={BUTTONS_ICON_WIDTH} />
            </div>
            {t('filesharingUpload.addFolder')}
          </div>
        </Button>
      </div>

      {filesThatWillBeOverwritten.length > 0 && (
        <WarningBox
          icon={<HiExclamationTriangle className=" text-ciYellow" />}
          title={
            hasMultipleDuplicates
              ? t('filesharingUpload.overwriteWarningTitleFiles')
              : t('filesharingUpload.overwriteWarningTitleFile')
          }
          description={
            hasMultipleDuplicates
              ? t('filesharingUpload.overwriteWarningDescriptionFiles')
              : t('filesharingUpload.overwriteWarningDescriptionFile')
          }
          filenames={filesThatWillBeOverwritten}
          borderColor="border-ciLightYellow"
          backgroundColor="bg-background"
          textColor="text-ciLightYellow"
        />
      )}

      {isAnyFileOversized && (
        <WarningBox
          icon={<HiExclamationTriangle className=" text-ciRed" />}
          title={
            hasMultipleOversizedFiles
              ? t('filesharingUpload.oversizedFilesDetected')
              : t('filesharingUpload.oversizedFileDetected')
          }
          description={t('filesharingUpload.cannotUploadOversized')}
          filenames={oversizedFiles.map((file) => file.name)}
          borderColor="border-ciLightRed"
          backgroundColor="bg-background"
          textColor="text-ciLightRed"
        />
      )}

      {tooLargeFolders.length > 0 && (
        <WarningBox
          icon={<HiExclamationTriangle className=" text-ciRed" />}
          title={t('filesharingUpload.folderTooLargeTitle')}
          description={t('filesharingUpload.folderTooLargeDescription')}
          filenames={tooLargeFolders.map((name) => name)}
          borderColor="border-ciRed"
          backgroundColor="bg-background"
          textColor="text-ciRed"
        />
      )}

      {filesToUpload.length > 0 && (
        <ScrollArea className="mt-2 max-h-[50vh] overflow-y-auto overflow-x-hidden rounded-xl border border-gray-600 px-2 scrollbar-thin">
          <ul className="my-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {filesToUpload.map((file) => {
              const isFolder = isFolderUpload(file);
              const fileName = displayName(file);

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

                  <Button
                    onClick={() => removeFile(fileName)}
                    className="absolute right-1 top-1 h-8 rounded-full bg-ciRed bg-opacity-70 p-2 hover:bg-ciRed"
                  >
                    <HiTrash className="text-text-ciRed h-4 w-4" />
                  </Button>

                  <div className="flex flex-col items-center justify-center">
                    <div className="truncate text-center text-xs text-neutral-500 underline transition-all duration-200 group-hover:min-w-full group-hover:overflow-visible group-hover:whitespace-normal group-hover:break-words group-hover:p-1">
                      {fileName}
                    </div>
                    {isFolder && (
                      <div className="text-center text-xs text-neutral-400">
                        {file.fileCount}{' '}
                        {file.fileCount === 1 ? t('filesharingUpload.file') : t('filesharingUpload.files')}
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
                            <HiEyeSlash className="h-3 w-3" />
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
