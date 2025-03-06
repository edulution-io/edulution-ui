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

import React, { useCallback, useState } from 'react';
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

const UploadContentBody = () => {
  const { t } = useTranslation();
  const { files } = useFileSharingStore();
  const [isFileSizeError, setIsFileSizeError] = useState(false);

  const [duplicates, setDuplicates] = useState<File[]>([]);

  const { filesToUpload, setFilesToUpload } = useFileSharingDialogStore();

  const removeFile = (name: string) => {
    setFilesToUpload((prevFiles) => prevFiles.filter((file) => file.name !== name));
    setDuplicates((prevDupes) => prevDupes.filter((file) => file.name !== name));
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const hasTooLargeFile = acceptedFiles.some((file) => bytesToMegabytes(file.size) > MAX_FILE_UPLOAD_SIZE);
      setIsFileSizeError(hasTooLargeFile);

      const filteredFiles = acceptedFiles.filter((file) => bytesToMegabytes(file.size) <= MAX_FILE_UPLOAD_SIZE);

      const foundDuplicates = filteredFiles.filter((file) => files.some((existing) => existing.basename === file.name));

      setDuplicates((prevDupes) => {
        const newDupes = foundDuplicates.filter(
          (dup) => !prevDupes.some((existingDup) => existingDup.name === dup.name),
        );
        return [...prevDupes, ...newDupes];
      });

      setFilesToUpload((prevFiles) => {
        const newFiles = filteredFiles.filter((file) => !prevFiles.some((f) => f.name === file.name));
        return [...prevFiles, ...newFiles];
      });
    },
    [setFilesToUpload, files],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const dropzoneStyle = `border-2 border-dashed border-gray-300 rounded-md p-10 mb-4 ${
    isDragActive ? 'bg-foreground' : 'bg-popover-foreground'
  }`;

  return (
    <form className="overflow-auto">
      <div {...getRootProps({ className: dropzoneStyle })}>
        <input {...getInputProps()} />
        {isFileSizeError ? (
          <div className="flex-col items-center justify-center text-ciRed">
            <HiExclamationTriangle className="mb-2 h-6 w-6" />
            <p className="font-bold">{t('filesharingUpload.dataLimitExceeded')}</p>
          </div>
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center space-y-2">
            <p className="text-center font-semibold text-secondary">
              {isDragActive ? t('filesharingUpload.dropHere') : t('filesharingUpload.dragDropClick')}
            </p>
            <MdOutlineCloudUpload className="h-12 w-12 text-muted" />
          </div>
        )}
      </div>

      <ScrollArea className="mt-2 max-h-[50vh] overflow-y-auto overflow-x-hidden rounded-xl border border-gray-600 px-2 scrollbar-thin">
        {duplicates.length > 0 && (
          <div className="mb-4 rounded border border-yellow-400 bg-yellow-50 p-3 text-yellow-800">
            <p className="font-bold">{t('filesharingUpload.overwriteWarningTitle')}</p>
            <p className="text-sm">{t('filesharingUpload.overwriteWarningDescription')}</p>
            <ul className="ml-4 list-disc">
              {duplicates.map((file) => (
                <li key={file.name}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}

        <ul className="my-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filesToUpload.map((file) => (
            <li
              key={file.name}
              className="group relative overflow-hidden rounded-xl border border-gray-700 p-2 shadow-lg transition-all duration-200
                 hover:min-h-[80px] hover:overflow-visible"
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
