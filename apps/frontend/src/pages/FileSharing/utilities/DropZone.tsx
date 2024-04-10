import React, { FC, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { DocumentIcon } from '@heroicons/react/16/solid';
import { MdOutlineCloudUpload } from 'react-icons/md';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Button } from '@/components/shared/Button';
import { useTranslation } from 'react-i18next';

export interface FileWithPreview extends File {
  preview: string;
}

interface DropZoneProps {
  files: FileWithPreview[];
  setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>;
}

export const DropZone: FC<DropZoneProps> = ({ files, setFiles }) => {
  const { t } = useTranslation();

  const removeFile = (name: string) => {
    setFiles((removed) => removed.filter((file) => file.name !== name));
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles.filter((file) => !files.some((f) => f.name === file.name));
      if (newFiles.length) {
        setFiles((previousFiles) => [
          ...previousFiles,
          ...acceptedFiles.map((file) => {
            const fileWithPreview: FileWithPreview = Object.assign(file, {
              preview: URL.createObjectURL(file),
            });
            return fileWithPreview;
          }),
        ]);
      }
    },
    [files, setFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const dropzoneStyle = `border-2 border-dashed border-gray-300 rounded-md p-10 ${
    isDragActive ? 'bg-gray-200' : 'bg-gray-100'
  }`;

  return (
    <form>
      <div {...getRootProps({ className: dropzoneStyle })}>
        <input {...getInputProps()} />
        {files.length <= 5 ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <p className="font-semibold text-gray-700">
              {isDragActive ? t('filesharingUpload.dropHere') : t('filesharingUpload.dragDropClick')}
            </p>
            <MdOutlineCloudUpload className="h-12 w-12 text-gray-500" />
          </div>
        ) : (
          <p className="font-bold text-red-700">{t('filesharingUpload.limitExceeded')}</p>
        )}
      </div>

      <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        {files.map((file) => (
          <li
            key={file.name}
            className="relative overflow-hidden rounded-md border p-2 shadow-lg"
          >
            {file.type.startsWith('image/') ? (
              <img
                src={file.preview}
                alt={t('filesharingUpload.previewAlt', { filename: file.preview })}
                className="mb-2 h-auto w-full object-cover"
                onLoad={() => URL.revokeObjectURL(file.preview)}
              />
            ) : (
              <div className="flex h-20 items-center justify-center">
                <DocumentIcon className="h-8 w-8 text-gray-500" />
              </div>
            )}
            <Button
              onClick={() => removeFile(file.name)}
              className="absolute right-0 top-0 rounded-full bg-white bg-opacity-70 p-1"
            >
              <XMarkIcon className="h-5 w-5 text-red-500 hover:text-red-700" />
            </Button>
            <div className="truncate text-center text-xs text-neutral-500 underline">{file.name}</div>
          </li>
        ))}
      </ul>
      <p className="pt-4 text-black underline">{t('filesharingUpload.filesToUpload')}</p>
      <ScrollArea className="h-[200px]">
        <ol
          type="1"
          className="text-black"
        >
          {files.map((file, i) => (
            <li key={file.name}>{`${i + 1}. ${file.name}`}</li>
          ))}
        </ol>
      </ScrollArea>
    </form>
  );
};
