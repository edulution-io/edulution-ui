import FilePreviewOptionsButton from '@/pages/FileSharing/buttonsBar/FilePreviewOptionsButton';
import React, { FC, ReactNode } from 'react';
import { MdFullscreen } from 'react-icons/md';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';
import { IoIosArrowForward } from 'react-icons/io';
import { ImNewTab } from 'react-icons/im';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/shared/Button';
import isDocumentExtension from '@libs/filesharing/utils/isDocumentExtension';
import { useTranslation } from 'react-i18next';

interface FileViewerLayoutProps {
  isLoading: boolean;
  renderComponent: () => ReactNode;
  editMode?: boolean;
  fileExtension?: string;
}

const FileViewerLayout: FC<FileViewerLayoutProps> = ({
  isLoading,
  renderComponent,
  editMode = false,
  fileExtension,
}) => {
  const { setCurrentlyEditingFile, currentlyEditingFile } = useFileSharingStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const openInNewTab = () => {
    if (currentlyEditingFile) {
      window.open('/onlyoffice', '_blank');
    }
  };

  return (
    <>
      <div>
        <h1 className="flex items-center justify-center text-2xl font-semibold">
          {editMode ? (
            <div className="flex flex-row">
              <Button
                variant="btn-small"
                className="bg-ciRed"
              >
                <p>{t('filesharing.closeEditor')}</p>
              </Button>
              {isDocumentExtension(fileExtension) && (
                <Button
                  variant="btn-small"
                  className="bg-gray-600"
                >
                  <p>{t('filesharing.saveFile')}</p>
                </Button>
              )}
            </div>
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
              onClick={() => {
                openInNewTab();
              }}
            />
            <FilePreviewOptionsButton
              icon={<MdFullscreen />}
              onClick={() => navigate('/onlyOffice')}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default FileViewerLayout;
