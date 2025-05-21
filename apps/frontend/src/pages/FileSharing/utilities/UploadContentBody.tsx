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
import { Button } from '@/components/shared/Button';
import { useTranslation } from 'react-i18next';
import { HiExclamationTriangle, HiTrash } from 'react-icons/hi2';
import { bytesToMegabytes } from '@/pages/FileSharing/utilities/filesharingUtilities';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import { ScrollArea } from '@/components/ui/ScrollArea';
import FileIconComponent from '@/pages/FileSharing/utilities/FileIconComponent';
import MAX_FILE_UPLOAD_SIZE from '@libs/ui/constants/maxFileUploadSize';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import WarningBox from '@/components/shared/WarningBox';
import JSZip from 'jszip';
import { TiDocumentAdd, TiFolderAdd } from 'react-icons/ti';
import { zipDirectoryEntry } from '@libs/filesharing/utils/zipDirectoryEntry';
import { UploadFile } from '@libs/filesharing/types/uploadFile';

const UploadContentBody = () => {
  const { t } = useTranslation();
  const { files } = useFileSharingStore();
  const [oversizedFiles, setOversizedFiles] = useState<File[]>([]);
  const { setSubmitButtonIsDisabled } = useFileSharingDialogStore();

  const [filesThatWillBeOverwritten, setFilesThatWillBeOverwritten] = useState<File[]>([]);

  const { filesToUpload, setFilesToUpload } = useFileSharingDialogStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  async function extractFilesFromEvent(event: DropEvent): Promise<File[]> {
    if ('dataTransfer' in event && event.dataTransfer) {
      const items = Array.from(event.dataTransfer.items ?? []);

      const resolved = await Promise.all(
        items.map(async (item) => {
          const entry = item.webkitGetAsEntry?.();
          if (entry && entry.isDirectory) {
            return zipDirectoryEntry(entry as FileSystemDirectoryEntry);
          }
          return item.getAsFile();
        }),
      );

      return resolved.filter((f): f is File => Boolean(f));
    }

    if ('target' in event && (event.target as HTMLInputElement).files) {
      return Array.from((event.target as HTMLInputElement).files!);
    }

    return [];
  }

  const splitFilesByMaxFileSize = (incomingFiles: File[], maxSizeMB: number): { oversize: File[]; normal: File[] } => {
    const oversize = incomingFiles.filter((f) => bytesToMegabytes(f.size) > maxSizeMB);
    const normal = incomingFiles.filter((f) => bytesToMegabytes(f.size) <= maxSizeMB);
    return { oversize, normal };
  };

  const findDuplicateFiles = (incomingFiles: File[], existingFiles: { basename: string }[]): File[] =>
    incomingFiles.filter((file) => existingFiles.some((existing) => existing.basename === file.name));

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const { oversize, normal } = splitFilesByMaxFileSize(acceptedFiles, MAX_FILE_UPLOAD_SIZE);

      const duplicates = findDuplicateFiles(normal, files);

      setOversizedFiles((prev) => [...prev, ...oversize.filter((f) => !prev.some((x) => x.name === f.name))]);

      setFilesThatWillBeOverwritten((prevDupes) => {
        const newDupes = duplicates.filter((dup) => !prevDupes.some((existingDup) => existingDup.name === dup.name));
        return [...prevDupes, ...newDupes];
      });

      setFilesToUpload((prevFiles) => {
        const allNewFiles = acceptedFiles.filter((file) => !prevFiles.some((f) => f.name === file.name));
        return [...prevFiles, ...allNewFiles];
      });
    },
    [files, setOversizedFiles, setFilesThatWillBeOverwritten, setFilesToUpload],
  );

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    onDrop(selected);
    e.target.value = '';
  };

  const handleFolderSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []) as UploadFile[];
    if (!selected.length) return;

    const root = selected[0].webkitRelativePath.split('/')[0];
    const zip = new JSZip();

    selected.forEach((f) => {
      zip.file(f.webkitRelativePath.replace(`${root}/`, ''), f);
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const zipFile: UploadFile = Object.assign(new File([blob], `${root}.zip`, { type: 'application/zip' }), {
      isZippedFolder: true,
      originalFolderName: root,
    });

    onDrop([zipFile]);
    e.target.value = '';
  };

  const removeFile = (name: string) => {
    setFilesToUpload((prev) => prev.filter((file) => file.name !== name));
    setFilesThatWillBeOverwritten((prev) => prev.filter((file) => file.name !== name));
    setOversizedFiles((prev) => prev.filter((file) => file.name !== name));
  };

  useEffect(() => {
    setSubmitButtonIsDisabled(oversizedFiles.length !== 0);
  }, [oversizedFiles]);

  const hasMultipleDuplicates = filesThatWillBeOverwritten.length > 1;
  const hasMultipleOversizedFiles = oversizedFiles.length > 1;
  const isAnyFileOversized = oversizedFiles.length > 0;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    getFilesFromEvent: (event) => extractFilesFromEvent(event),
    onDrop,
  });

  const renderPreview = (file: UploadFile) => {
    if (file.isZippedFolder) {
      return (
        <div className="flex h-20 items-center justify-center">
          <TiFolderAdd size={60} />
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

      <div className="flex w-full gap-2">
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
      </div>

      {filesThatWillBeOverwritten.length > 0 && (
        <WarningBox
          icon={<HiExclamationTriangle className="text-ciYellow" />}
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
          items={filesThatWillBeOverwritten}
          borderColor="border-ciLightYellow"
          backgroundColor="bg-background"
          textColor="text-ciLightYellow"
        />
      )}

      {isAnyFileOversized && (
        <WarningBox
          icon={<HiExclamationTriangle className="text-ciRed" />}
          title={
            hasMultipleOversizedFiles
              ? t('filesharingUpload.oversizedFilesDetected')
              : t('filesharingUpload.oversizedFileDetected')
          }
          description={t('filesharingUpload.cannotUploadOversized')}
          items={oversizedFiles}
          borderColor="border-ciLightRed"
          backgroundColor="bg-background"
          textColor="text-ciLightRed"
        />
      )}

      <ScrollArea className="mt-2 max-h-[50vh] overflow-y-auto overflow-x-hidden rounded-xl border border-gray-600 px-2 scrollbar-thin">
        <ul className="my-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filesToUpload.map((file) => (
            <li
              key={file.name}
              className={
                `group relative overflow-hidden rounded-xl border p-2 shadow-lg transition-all duration-200 hover:min-h-[80px] hover:overflow-visible ` +
                `${bytesToMegabytes(file.size) < MAX_FILE_UPLOAD_SIZE ? 'border-accent' : 'border-ciRed  opacity-50'}`
              }
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
          ))}
        </ul>
      </ScrollArea>
    </form>
  );
};

export default UploadContentBody;
