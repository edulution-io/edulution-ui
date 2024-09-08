import React, { FC, ReactNode } from 'react';
import { MdFullscreen } from 'react-icons/md';
import { IoIosArrowForward } from 'react-icons/io';
import { ImNewTab } from 'react-icons/im';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import FilePreviewOptionsButton from '@/pages/FileSharing/buttonsBar/FilePreviewOptionsButton';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useBeforeUnload from '@/hooks/useBeforeUnload';
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/useFileEditorStore';
import ControlPanel from '@/components/shared/ControlPanel';

interface FileViewerLayoutProps {
  isLoading: boolean;
  renderComponent: () => ReactNode;
  editMode?: boolean;
}

const FileViewerLayout: FC<FileViewerLayoutProps> = ({ isLoading, renderComponent, editMode = false }) => {
  const { setCurrentlyEditingFile, currentlyEditingFile } = useFileSharingStore();
  const { setShowEditor } = useFileEditorStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useBeforeUnload(editMode ? t('closeEditingWindow') : '', setCurrentlyEditingFile);

  const tabParam = searchParams.get('tab');

  const openInNewTab = () => {
    if (currentlyEditingFile) {
      window.open('/onlyoffice?tab=true', '_blank');
    }
  };

  const openFullScreen = () => {
    if (currentlyEditingFile) {
      navigate('/onlyOffice?tab=false');
    }
  };

  const closeOrNavigateBack = () => {
    if (tabParam === 'false') {
      navigate(-1);
      setShowEditor(false);
      setCurrentlyEditingFile(null);
    } else {
      window.close();
    }
  };

  return (
    <>
      <div>
        <h1 className="flex items-center justify-center pt-8 text-2xl font-semibold">
          {editMode ? (
            <ControlPanel
              onClose={closeOrNavigateBack}
              showMinimize={false}
            />
          ) : (
            <p>{t('filesharing.previewTitle')}</p>
          )}
        </h1>
      </div>
      <div className="flex w-full flex-row">
        {!isLoading && !editMode && (
          <FilePreviewOptionsButton
            icon={<IoIosArrowForward />}
            onClick={() => setCurrentlyEditingFile(null)}
          />
        )}
        <div className="flex-grow">{renderComponent()}</div>

        {!isLoading && !editMode && (
          <div className="flex flex-col space-y-2">
            <FilePreviewOptionsButton
              icon={<ImNewTab />}
              onClick={openInNewTab}
            />
            <FilePreviewOptionsButton
              icon={<MdFullscreen />}
              onClick={openFullScreen}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default FileViewerLayout;
