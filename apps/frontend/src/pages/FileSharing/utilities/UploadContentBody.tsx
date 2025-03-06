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

import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
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

const UploadContentBody = () => {
  const { t } = useTranslation();
  const { files } = useFileSharingStore();
  const [oversizeFiles, setOversizeFiles] = useState<File[]>([]);
  const { setSubmitButtonIsInActive } = useFileSharingDialogStore();

  const [filesThatWillBeOverridden, setFilesThatWillBeOverridden] = useState<File[]>([]);

  const { filesToUpload, setFilesToUpload } = useFileSharingDialogStore();

  const splitByMaxFileSize = (incomingFiles: File[], maxSizeMB: number): { oversize: File[]; normal: File[] } => {
    const oversize = incomingFiles.filter((f) => bytesToMegabytes(f.size) > maxSizeMB);
    const normal = incomingFiles.filter((f) => bytesToMegabytes(f.size) <= maxSizeMB);
    return { oversize, normal };
  };

  const findDuplicates = (incomingFiles: File[], existingFiles: { basename: string }[]): File[] =>
    incomingFiles.filter((file) => existingFiles.some((existing) => existing.basename === file.name));

  const removeFile = (name: string) => {
    setFilesToUpload((prev) => prev.filter((file) => file.name !== name));
    setFilesThatWillBeOverridden((prev) => prev.filter((file) => file.name !== name));
    setOversizeFiles((prev) => prev.filter((file) => file.name !== name));
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const { oversize, normal } = splitByMaxFileSize(acceptedFiles, MAX_FILE_UPLOAD_SIZE);

      const duplicates = findDuplicates(normal, files);

      setOversizeFiles((prev) => [...prev, ...oversize.filter((f) => !prev.some((x) => x.name === f.name))]);

      setFilesThatWillBeOverridden((prevDupes) => {
        const newDupes = duplicates.filter((dup) => !prevDupes.some((existingDup) => existingDup.name === dup.name));
        return [...prevDupes, ...newDupes];
      });

      setFilesToUpload((prevFiles) => {
        const allNewFiles = acceptedFiles.filter((file) => !prevFiles.some((f) => f.name === file.name));
        return [...prevFiles, ...allNewFiles];
      });
    },
    [files, setOversizeFiles, setFilesThatWillBeOverridden, setFilesToUpload],
  );

  useEffect(() => {
    setSubmitButtonIsInActive(oversizeFiles.length !== 0);
  }, [oversizeFiles]);

  const areDuplicatesPlural = filesThatWillBeOverridden.length > 1;
  const areOversizePlural = oversizeFiles.length > 1;
  const isAnyFileOversize = oversizeFiles.length > 0;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
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

      {filesThatWillBeOverridden.length > 0 && (
        <WarningBox
          icon={<HiExclamationTriangle className="text-yellow-500" />}
          title={
            areDuplicatesPlural
              ? t('filesharingUpload.overwriteWarningTitleFiles')
              : t('filesharingUpload.overwriteWarningTitleFile')
          }
          description={
            areDuplicatesPlural
              ? t('filesharingUpload.overwriteWarningDescriptionFiles')
              : t('filesharingUpload.overwriteWarningDescriptionFile')
          }
          items={filesThatWillBeOverridden}
          borderColor="border-yellow-400"
          backgroundColor="bg-yellow-50"
          textColor="text-yellow-800"
        />
      )}

      {isAnyFileOversize && (
        <WarningBox
          icon={<HiExclamationTriangle className="text-red-500" />}
          title={
            areOversizePlural
              ? t('filesharingUpload.oversizedFilesDetected')
              : t('filesharingUpload.oversizedFileDetected')
          }
          description={t('filesharingUpload.cannotUploadOversized')}
          items={oversizeFiles}
          borderColor="border-red-400"
          backgroundColor="bg-red-50"
          textColor="text-red-800"
        />
      )}

      <ScrollArea className="mt-2 max-h-[50vh] overflow-y-auto overflow-x-hidden rounded-xl border border-gray-600 px-2 scrollbar-thin">
        <ul className="my-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filesToUpload.map((file) => (
            <li
              key={file.name}
              className={`
                  group relative overflow-hidden rounded-xl border p-2 shadow-lg 
                  transition-all duration-200 hover:min-h-[80px] hover:overflow-visible
                  ${bytesToMegabytes(file.size) < MAX_FILE_UPLOAD_SIZE ? 'border-gray-700' : 'border-red-700 bg-red-50  opacity-50'}
                `}
            >
              {file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={t('filesharingUpload.previewAlt', { filename: file.name })}
                  className="mb-2 h-auto w-full object-cover"
                  onLoad={() => URL.revokeObjectURL(file.name)}
                />
              ) : (
                <div className="flex h-20 items-center justify-center">
                  <FileIconComponent
                    size={60}
                    filename={file.name}
                  />
                </div>
              )}

              <Button
                onClick={() => removeFile(file.name)}
                className="absolute right-1 top-1 h-8 rounded-full bg-red-500 bg-opacity-70 p-2 hover:bg-red-600"
              >
                <HiTrash className="text-text-ciRed h-4 w-4" />
              </Button>

              <div className="flex items-center justify-center">
                <div
                  className="truncate text-center text-xs text-neutral-500 underline transition-all duration-200
                             group-hover:min-w-full group-hover:overflow-visible group-hover:whitespace-normal
                             group-hover:break-words group-hover:p-1"
                >
                  {file.name}
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
