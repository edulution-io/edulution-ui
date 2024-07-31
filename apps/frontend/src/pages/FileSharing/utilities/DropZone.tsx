import React, { FC, useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { MdOutlineCloudUpload } from 'react-icons/md';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Button } from '@/components/shared/Button';
import { useTranslation } from 'react-i18next';
import { HiDocument, HiXMark } from 'react-icons/hi2';
import { bytesToMegabytes } from '@/pages/FileSharing/utilities/filesharingUtilities';
import Progress from '@/components/ui/Progress';
import { MAX_FILE_UPLOAD_SIZE, MAX_FILE_UPLOAD_SIZE_UNIT } from '@libs/ui/constants/maxFileUploadSize';

interface DropZoneProps {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

const DropZone: FC<DropZoneProps> = ({ files, setFiles }) => {
  const { t } = useTranslation();
  const [fileUploadSize, setFileUploadSize] = useState(0);

  const removeFile = (name: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== name));
  };

  useEffect(() => {
    const totalSize = files.reduce((total, file) => total + bytesToMegabytes(file.size), 0);
    setFileUploadSize(totalSize);
  }, [files]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles((prevFiles) => {
        const newFiles = acceptedFiles.filter((file) => !prevFiles.some((f) => f.name === file.name));
        return [...prevFiles, ...newFiles];
      });
    },
    [setFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const dropzoneStyle = `border-2 border-dashed border-gray-300 rounded-md p-10 ${
    isDragActive ? 'bg-gray-200' : 'bg-gray-100'
  }`;

  return (
    <form>
      <div {...getRootProps({ className: dropzoneStyle })}>
        <input {...getInputProps()} />
        {files.length < 5 && fileUploadSize < MAX_FILE_UPLOAD_SIZE ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <p className="font-semibold text-gray-700">
              {isDragActive ? t('filesharingUpload.dropHere') : t('filesharingUpload.dragDropClick')}
            </p>
            <MdOutlineCloudUpload className="h-12 w-12 text-gray-500" />
          </div>
        ) : (
          <p className="font-bold">
            {fileUploadSize > MAX_FILE_UPLOAD_SIZE
              ? t('filesharingUpload.dataLimitExceeded')
              : t('filesharingUpload.limitExceeded')}
          </p>
        )}
      </div>
      <div>
        <Progress value={(fileUploadSize / MAX_FILE_UPLOAD_SIZE) * 100} />
        <div className="flex flex-row justify-between text-foreground">
          <p>{t('filesharingUpload.fileSize')}:</p>
          <p>
            {fileUploadSize.toFixed(2)} / {MAX_FILE_UPLOAD_SIZE}
            {MAX_FILE_UPLOAD_SIZE_UNIT}
          </p>
        </div>
      </div>

      <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        {files.map((file) => (
          <li
            key={file.name}
            className="relative overflow-hidden rounded-md border p-2 shadow-lg"
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
                <HiDocument className="h-8 w-8 text-gray-500" />
              </div>
            )}
            <Button
              onClick={() => removeFile(file.name)}
              className="absolute right-0 top-0 rounded-full bg-white bg-opacity-70 p-1"
            >
              <HiXMark className="h-5 w-5 text-red-500 hover:text-red-700" />
            </Button>
            <div className="truncate text-center text-xs text-neutral-500 underline">{file.name}</div>
          </li>
        ))}
      </ul>
      <p className="pt-4 text-foreground underline">{t('filesharingUpload.filesToUpload')}</p>
      <ScrollArea className="max-h-[30vh]">
        <ol
          type="1"
          className="text-foreground"
        >
          {files.map((file, i) => (
            <li
              key={file.name}
              className="flex w-full items-center justify-between rounded bg-white p-2 shadow"
            >
              <span className="w-full truncate">{`${i + 1}. ${file.name}`}</span>
            </li>
          ))}
        </ol>
      </ScrollArea>
    </form>
  );
};

export default DropZone;
