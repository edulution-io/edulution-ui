/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DropEvent, useDropzone } from 'react-dropzone';
import { MdOutlineCloudUpload } from 'react-icons/md';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/shared/Button';
import { useTranslation } from 'react-i18next';
import { HiExclamationTriangle, HiTrash } from 'react-icons/hi2';
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
import UploadFolder from '@libs/filesharing/types/uploadFolder';
import UploadFolderFile from '@libs/filesharing/types/uploadFolderFile';
import { UploadItem } from '@libs/filesharing/types/uploadItem';
import traverseFileTree from '@libs/filesharing/utils/traverseFileTree';
import createUploadFolderTree from '@libs/filesharing/utils/createUploadFolderTree';
import DataTransferItemWithEntry from '@libs/filesharing/types/dataTransferItemWithEntry';

const UploadContentBody = () => {
  const { webdavShare } = useParams();
  const { t } = useTranslation();
  const { files, webdavShares } = useFileSharingStore();
  const [oversizedFiles, setOversizedFiles] = useState<File[]>([]);
  const [tooLargeFolders, setTooLargeFolders] = useState<string[]>([]);
  const { setSubmitButtonIsDisabled } = useFileSharingDialogStore();

  const supportsWebkitDirectory = 'webkitdirectory' in document.createElement('input');

  const [filesThatWillBeOverwritten, setFilesThatWillBeOverwritten] = useState<string[]>([]);

  const { filesToUpload, setFilesToUpload, updateFilesToUpload } = useHandelUploadFileStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const hasMultipleDuplicates = filesThatWillBeOverwritten.length > 1;
  const hasMultipleOversizedFiles = oversizedFiles.length > 1;
  const isAnyFileOversized = oversizedFiles.length > 0;

  const getPath = (uploadFile: UploadFile | { webkitRelativePath?: string; relativePath?: string }): string => {
    if (
      'webkitRelativePath' in uploadFile &&
      typeof uploadFile.webkitRelativePath === 'string' &&
      uploadFile.webkitRelativePath.length > 0
    ) {
      return uploadFile.webkitRelativePath;
    }
    if (
      'relativePath' in uploadFile &&
      typeof uploadFile.relativePath === 'string' &&
      uploadFile.relativePath.length > 0
    ) {
      return uploadFile.relativePath;
    }
    return '';
  };

  const displayName = (file: UploadFile | { name: string }): string => {
    if (!('isZippedFolder' in file)) return file.name;

    if (file.isZippedFolder && file.originalFolderName) return file.originalFolderName;
    return file.name.replace(/\.zip$/i, '');
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
      .filter((filename) => existingFilenameSet.has(normalize(displayName(filename))))
      .map((filename) => ({ name: displayName(filename) }));
  };

  const duplicateKey = (f: UploadFile | { name: string; isZippedFolder?: boolean; originalFolderName?: string }) =>
    'isZippedFolder' in f && f.isZippedFolder && f.originalFolderName
      ? f.originalFolderName
      : f.name.replace(/\.zip$/i, '');

  const mapFolderTreeToFolderAsFile = (folder: UploadFolder): UploadFolderFile =>
    Object.assign(new File([], folder.name, { type: 'folder/virtual' }), {
      isZippedFolder: true,
      originalFolderName: folder.name,
      fileCount: folder.files.length + folder.subfolders.length,
      containedFiles: folder.files,
      containedSubfolders: folder.subfolders.map(mapFolderTreeToFolderAsFile),
    });

  const onDrop = useCallback(
    (acceptedFiles: UploadFile[]) => {
      if (!acceptedFiles.length) return;
      const isFolderDrop = acceptedFiles.some((file) => {
        const path = getPath(file);
        return path && path.includes('/');
      });

      if (isFolderDrop) {
        const folderTree = createUploadFolderTree(acceptedFiles, getPath);
        useHandelUploadFileStore.getState().addFolder(folderTree);

        const folderAsFile = mapFolderTreeToFolderAsFile(folderTree);
        updateFilesToUpload((prev) => [...prev, folderAsFile]);

        return;
      }

      const { oversize, normal } = splitFilesByMaxFileSize(
        acceptedFiles,
        getFileUploadLimit(webdavShares, webdavShare),
      );

      const duplicates = findDuplicateFiles(normal, files);

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
        const allNewFiles: UploadItem[] = acceptedFiles.filter((file) => !prevFiles.some((f) => f.name === file.name));
        return [...prevFiles, ...allNewFiles];
      });
    },
    [
      files,
      updateFilesToUpload,
      setOversizedFiles,
      setFilesThatWillBeOverwritten,
      setFilesToUpload,
      setTooLargeFolders,
      webdavShare,
      webdavShares,
    ],
  );

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    onDrop(selected as UploadFile[]);
    e.target.value = '';
  };

  const handleFolderSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []) as UploadFile[];
    if (!selected.length) return;

    const folderTree = createUploadFolderTree(selected, getPath);
    useHandelUploadFileStore.getState().addFolder(folderTree);
    const folderAsFile = mapFolderTreeToFolderAsFile(folderTree);
    useHandelUploadFileStore.getState().updateFilesToUpload((prev) => [...prev, folderAsFile]);
  };

  const removeFile = (name: string) => {
    updateFilesToUpload((prev) => prev.filter((file) => file.name !== name));
    setOversizedFiles((prev) => prev.filter((f) => f.name !== name));
    const key = duplicateKey({ name } as UploadFile);
    setFilesThatWillBeOverwritten((prev) => prev.filter((k) => k !== key));
    setTooLargeFolders((prev) => prev.filter((k) => k !== key));
  };

  useEffect(() => {
    setSubmitButtonIsDisabled(oversizedFiles.length !== 0 || tooLargeFolders.length !== 0);
  }, [oversizedFiles, tooLargeFolders, setSubmitButtonIsDisabled]);

  const getFilesFromEvent = async (event: DropEvent): Promise<UploadFile[]> => {
    const items: DataTransferItemWithEntry[] =
      'dataTransfer' in event && event.dataTransfer?.items
        ? (Array.from(event.dataTransfer.items) as DataTransferItemWithEntry[])
        : [];

    const nested: UploadFile[][] = await Promise.all(
      items.map((item) => {
        const entry = item.webkitGetAsEntry?.();
        return entry ? traverseFileTree(entry) : Promise.resolve<UploadFile[]>([]);
      }),
    );

    return nested.flat();
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    getFilesFromEvent,
    onDrop,
  });

  const renderPreview = (file: UploadFile) => {
    if (file.isZippedFolder) {
      return (
        <div className="flex h-20 items-center justify-center">
          <FcFolder size={60} />
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
          size={60}
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
        <p>refoihfiperp</p>
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
            <TiDocumentAdd size={24} />
            {t('filesharingUpload.addFiles')}
          </div>
        </Button>

        {supportsWebkitDirectory && (
          <Button
            variant="btn-collaboration"
            className="flex-1"
            type="button"
            onClick={() => folderInputRef.current?.click()}
          >
            <div className="flex flex-col items-center">
              <TiFolderAdd size={24} />
              {t('filesharingUpload.addFolder')}
            </div>
          </Button>
        )}
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
            {(filesToUpload as UploadFile[]).map((file) => {
              const isFolderTooLarge =
                file?.isZippedFolder && tooLargeFolders.includes(file.originalFolderName ?? file.name);

              let baseBorderClass = 'border-accent';

              if (isFolderTooLarge || bytesToMegabytes(file.size) > getFileUploadLimit(webdavShares, webdavShare)) {
                baseBorderClass = 'border-ciRed opacity-50';
              }

              return (
                <li
                  key={file.name}
                  className={`group relative overflow-hidden rounded-xl border p-2 shadow-lg transition-all duration-200 hover:min-h-[80px] hover:overflow-visible ${
                    baseBorderClass
                  }`}
                >
                  {renderPreview(file)}

                  <Button
                    onClick={() => removeFile(file.name)}
                    className="absolute right-1 top-1 h-8 rounded-full bg-ciRed bg-opacity-70 p-2 hover:bg-ciRed"
                  >
                    <HiTrash className="text-text-ciRed h-4 w-4" />
                  </Button>

                  <div className="flex items-center justify-center">
                    <div className="truncate text-center text-xs text-neutral-500 underline transition-all duration-200 group-hover:min-w-full group-hover:overflow-visible group-hover:whitespace-normal group-hover:break-words group-hover:p-1">
                      {'isZippedFolder' in file && file.isZippedFolder && 'originalFolderName' in file
                        ? file.originalFolderName
                        : file.name}
                    </div>
                  </div>
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
