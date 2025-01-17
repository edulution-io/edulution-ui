import React, { FC, ReactNode } from 'react';
import { MdFullscreen } from 'react-icons/md';
import { IoIosArrowForward } from 'react-icons/io';
import { ImNewTab } from 'react-icons/im';
import { useTranslation } from 'react-i18next';

import FilePreviewOptionsButton from '@/pages/FileSharing/buttonsBar/FilePreviewOptionsButton';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useBeforeUnload from '@/hooks/useBeforeUnload';
import ONLY_OFFICE_ROUTE from '@libs/filesharing/constants/routes';

interface FileViewerLayoutProps {
  isLoading: boolean;
  children: ReactNode;
  editMode?: boolean;
}

const FileViewerLayout: FC<FileViewerLayoutProps> = ({ isLoading, children, editMode = false }) => {
  const { setCurrentlyEditingFile, currentlyEditingFile, setIsFullScreenEditingEnabled } = useFileSharingStore();
  const { t } = useTranslation();

  useBeforeUnload(editMode ? t('closeEditingWindow') : '', setCurrentlyEditingFile);

  const openInNewTab = () => {
    if (currentlyEditingFile) {
      window.open(`/${ONLY_OFFICE_ROUTE}?tab=true`, '_blank');
    }
  };

  return (
    <>
      {!editMode && (
        <div className="pb-1">
          <p>{t('filesharing.previewTitle')}:</p>
        </div>
      )}
      <div className="flex w-full flex-row">
        {!isLoading && !editMode && (
          <FilePreviewOptionsButton
            icon={<IoIosArrowForward />}
            onClick={() => setCurrentlyEditingFile(null)}
          />
        )}
        <div className="flex-grow">{children}</div>

        {!isLoading && !editMode && (
          <div className="flex flex-col space-y-2">
            <FilePreviewOptionsButton
              icon={<ImNewTab />}
              onClick={openInNewTab}
            />
            <FilePreviewOptionsButton
              icon={<MdFullscreen />}
              onClick={() => setIsFullScreenEditingEnabled(true)}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default FileViewerLayout;
