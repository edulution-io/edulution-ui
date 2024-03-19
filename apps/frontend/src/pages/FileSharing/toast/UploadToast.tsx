import React, { useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import  useFileManagerStore  from '@/store/fileManagerStore';
import Progress from '@/components/ui/progress';

const UploadToast = () => {
  const fileUploadProgresses = useFileManagerStore((state) => state.uploadProgresses);

  useEffect(() => {
    Object.entries(fileUploadProgresses).forEach(([fileName, progress]) => {
      toast.custom(
        () => (
          <div
            className="flex items-center justify-center rounded-full bg-white shadow-md"
            style={{ width: '350px' }}
          >
            <div
              className="truncate"
              style={{ maxWidth: '310px' }}
            >
              <p className="text-sm font-semibold text-gray-900">{fileName}</p>
              <Progress
                value={parseFloat(progress.toFixed(2))}
                className="h-2 overflow-hidden rounded-full bg-gray-200"
              />
              <p className="mt-1 text-xs text-gray-500">{parseFloat(progress.toFixed(1))}% Complete</p>
            </div>
          </div>
        ),
        {
          id: fileName,
          duration: Infinity,
        },
      );
      if (fileUploadProgresses[fileName] >= 100) {
        setTimeout(() => toast.dismiss(fileName));
      }
    });
  }, [fileUploadProgresses]);

  return <Toaster />;
};

export default UploadToast;
