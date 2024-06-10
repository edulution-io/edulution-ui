import React, { useEffect, useMemo } from 'react';
import {
  MdOutlineDeleteOutline,
  MdOutlineDriveFileMove,
  MdOutlineFileDownload,
  MdOutlineNoteAdd,
} from 'react-icons/md';
import useFileManagerStoreOLD from '@/store/fileManagerStoreOLD';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { IconContext } from 'react-icons';
import { FiUpload } from 'react-icons/fi';
import { HiOutlineFolderAdd } from 'react-icons/hi';
import StatusAlert from '@/pages/FileSharing/alerts/StatusAlert';
import DirectoryBreadcrumb from '@/pages/FileSharing/DirectoryBreadcrumb';
import ActionTooltip from '@/pages/FileSharing/utilities/ActionTooltip';
import CreateNewContentDialog from '@/pages/FileSharing/dialog/CreateNewContentDialog';
import UploadItemDialog from '@/pages/FileSharing/dialog/UploadItemDialog';
import MoveItemDialog from '@/pages/FileSharing/dialog/MoveItemDialog';
import DataTable from '@/pages/FileSharing/table/DataTable';
import Columns from '@/pages/FileSharing/table/Columns';
import UploadToast from '@/pages/FileSharing/toast/UploadToast';
import { ContentType } from '@/datatypes/filesystem';
import DeleteItemAlert from '@/pages/FileSharing/alerts/DeleteItemAlert';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';

const FileSharingPage = () => {
  const {
    handleDownload,
    isLoading,
    isVisible,
    fileOperationMessage,
    fileOperationSuccessful,
    setCurrentPath,
    selectedItems,
    fetchFiles,
    files,
    currentPath,
  } = useFileManagerStoreOLD();
  const { t } = useTranslation();

  useEffect(() => {
    fetchFiles().catch(console.error);
  }, [currentPath, fileOperationSuccessful]);

  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8 m-5' }), []);

  return (
    <div className="w-full overflow-x-auto">
      <div>
        {isLoading && <LoadingIndicator isOpen={isLoading} />}
        {isVisible && (
          <StatusAlert
            success={fileOperationSuccessful}
            message={fileOperationMessage}
          />
        )}
      </div>
      <div className="flex-1 overflow-auto">
        <div className="flex w-full justify-between pb-3 pt-3">
          <TooltipProvider>
            <div className="flex flex-col ">
              <div className="flex space-x-2">
                <DirectoryBreadcrumb
                  path={currentPath}
                  onNavigate={(path) => {
                    setCurrentPath(path);
                  }}
                  style={{ color: 'white' }}
                />
              </div>
            </div>
          </TooltipProvider>
        </div>
        <div
          className="w-full md:w-auto md:max-w-7xl xl:max-w-full"
          data-testid="test-id-file-sharing-page-data-table"
        >
          <DataTable
            columns={Columns}
            data={files}
          />
        </div>

        <div className="fixed bottom-8 flex flex-row space-x-24 bg-opacity-90">
          <TooltipProvider>
            {selectedItems.length === 0 && (
              <>
                <ActionTooltip
                  onAction={() => {}}
                  tooltipText={t('tooltip.create.file')}
                  trigger={
                    <CreateNewContentDialog
                      trigger={
                        <Button
                          type="button"
                          variant="btn-hexagon"
                          className="fixed bottom-10 space-x-4 bg-opacity-90 p-4"
                        >
                          <IconContext.Provider value={iconContextValue}>
                            <MdOutlineNoteAdd />
                          </IconContext.Provider>
                        </Button>
                      }
                      contentType={ContentType.file}
                    />
                  }
                />
                <ActionTooltip
                  onAction={() => {}}
                  tooltipText={t('tooltip.create.folder')}
                  trigger={
                    <CreateNewContentDialog
                      trigger={
                        <Button
                          type="button"
                          variant="btn-hexagon"
                          className="fixed bottom-10 space-x-4 bg-opacity-90 p-4"
                        >
                          <IconContext.Provider value={iconContextValue}>
                            <HiOutlineFolderAdd />
                          </IconContext.Provider>
                        </Button>
                      }
                      contentType={ContentType.directory}
                    />
                  }
                />
                <ActionTooltip
                  onAction={() => {}}
                  tooltipText={t('tooltip.upload')}
                  trigger={
                    <UploadItemDialog
                      trigger={
                        <Button
                          type="button"
                          variant="btn-hexagon"
                          className="fixed bottom-10 space-x-4 bg-opacity-90 p-4"
                        >
                          <IconContext.Provider value={iconContextValue}>
                            <FiUpload />
                          </IconContext.Provider>
                        </Button>
                      }
                    />
                  }
                />
              </>
            )}
            {selectedItems.length > 0 && (
              <div className="flex flex-row space-x-24">
                <ActionTooltip
                  onAction={() => {}}
                  tooltipText={t('tooltip.move')}
                  trigger={
                    <MoveItemDialog
                      trigger={
                        <Button
                          type="button"
                          variant="btn-hexagon"
                          className="fixed bottom-10 space-x-4 bg-opacity-90 p-4"
                        >
                          <IconContext.Provider value={iconContextValue}>
                            <MdOutlineDriveFileMove />
                          </IconContext.Provider>
                        </Button>
                      }
                      item={selectedItems}
                    />
                  }
                />

                <ActionTooltip
                  onAction={() => {}}
                  tooltipText={t('tooltip.delete')}
                  trigger={
                    <DeleteItemAlert
                      trigger={
                        <Button
                          type="button"
                          variant="btn-hexagon"
                          className="fixed bottom-10 space-x-4 bg-opacity-90 p-4"
                        >
                          <IconContext.Provider value={iconContextValue}>
                            <MdOutlineDeleteOutline />
                          </IconContext.Provider>
                        </Button>
                      }
                      file={selectedItems}
                    />
                  }
                />
                <ActionTooltip
                  onAction={() => {
                    handleDownload(selectedItems).catch(() => {});
                  }}
                  tooltipText={t('tooltip.download')}
                  trigger={
                    <Button
                      type="button"
                      variant="btn-hexagon"
                      className="fixed bottom-10 space-x-4 bg-opacity-90 p-4"
                      data-testid="test-id-file-sharing-page-download-button"
                    >
                      <IconContext.Provider value={iconContextValue}>
                        <MdOutlineFileDownload />
                      </IconContext.Provider>
                    </Button>
                  }
                />
              </div>
            )}
          </TooltipProvider>
        </div>
        <UploadToast />
      </div>
    </div>
  );
};

export default FileSharingPage;
