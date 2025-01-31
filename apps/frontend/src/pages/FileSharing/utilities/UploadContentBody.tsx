import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { MdOutlineCloudUpload } from 'react-icons/md';
import { Button } from '@/components/shared/Button';
import { useTranslation } from 'react-i18next';
import { HiExclamationTriangle, HiTrash } from 'react-icons/hi2';
import { bytesToMegabytes } from '@/pages/FileSharing/utilities/filesharingUtilities';
import Progress from '@/components/ui/Progress';
import MAX_FILE_UPLOAD_SIZE from '@libs/ui/constants/maxFileUploadSize';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/useFileSharingDialogStore';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import ActionTooltip from '@/components/shared/ActionTooltip';
import FileIconComponent from '@/pages/FileSharing/utilities/FileIconComponent';

const UploadContentBody = () => {
  const { t } = useTranslation();
  const [fileUploadSize, setFileUploadSize] = useState(0);
  const { filesToUpload: files, setFilesToUpload: setFiles, setSubmitButtonIsInActive } = useFileSharingDialogStore();

  const removeFile = (name: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== name));
  };

  useEffect(() => {
    const totalSize = files.reduce((total, file) => total + bytesToMegabytes(file.size), 0);
    setFileUploadSize(totalSize);
    if (totalSize > MAX_FILE_UPLOAD_SIZE || totalSize === 0) {
      setSubmitButtonIsInActive(true);
    } else {
      setSubmitButtonIsInActive(false);
    }
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
  const dropzoneStyle = `border-2 border-dashed border-gray-300 rounded-md p-10 mb-4 ${
    isDragActive ? 'bg-foreground' : 'bg-popover-foreground'
  }`;

  return (
    <form className="overflow-auto">
      <div {...getRootProps({ className: dropzoneStyle })}>
        <input {...getInputProps()} />
        {files.length < 5 && fileUploadSize < MAX_FILE_UPLOAD_SIZE ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <p className="font-semibold text-secondary">
              {isDragActive ? t('filesharingUpload.dropHere') : t('filesharingUpload.dragDropClick')}
            </p>
            <MdOutlineCloudUpload className="h-12 w-12 text-muted" />
          </div>
        ) : (
          <p className="inline-flex items-center font-bold text-ciRed">
            <HiExclamationTriangle className="mr-2 h-6 w-6" />
            {fileUploadSize > MAX_FILE_UPLOAD_SIZE
              ? t('filesharingUpload.dataLimitExceeded')
              : t('filesharingUpload.limitExceeded')}
          </p>
        )}
      </div>
      <div>
        <Progress value={(fileUploadSize / MAX_FILE_UPLOAD_SIZE) * 100} />
        <div className="flex flex-row justify-between text-background">
          <p>{t('filesharingUpload.fileSize')}</p>
          <p>
            {fileUploadSize.toFixed(2)} / {MAX_FILE_UPLOAD_SIZE}MB
          </p>
        </div>
      </div>

      <ScrollArea className="mt-2 max-h-[50vh] overflow-y-auto overflow-x-hidden rounded-xl border border-gray-600 px-2 scrollbar-thin">
        <ul className="my-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {files.map((file) => (
            <li
              key={file.name}
              className="relative overflow-hidden rounded-xl border border-gray-700 p-2 shadow-lg"
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
                className="absolute right-1 top-1 h-8 rounded-full bg-red-500 bg-opacity-70 p-2"
              >
                <HiTrash className="text-text-ciRed h-4 w-4 hover:text-red-700" />
              </Button>

              <TooltipProvider>
                <ActionTooltip
                  tooltipText={file.name}
                  trigger={<div className="truncate text-center text-xs text-neutral-500 underline">{file.name}</div>}
                />
              </TooltipProvider>
            </li>
          ))}
        </ul>
      </ScrollArea>
    </form>
  );
};

export default UploadContentBody;
