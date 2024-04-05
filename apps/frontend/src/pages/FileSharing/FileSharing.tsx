import React, { useEffect } from 'react';
import {
  MdOutlineDeleteOutline,
  MdOutlineDriveFileMove,
  MdOutlineFileDownload,
  MdOutlineNoteAdd,
} from 'react-icons/md';
import useFileManagerStore from '@/store/fileManagerStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { TooltipProvider } from '@/components/ui/Tooltip';
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
import HexagonButton from '@/components/shared/HexagonButton';
import DeleteItemAlert from '@/pages/FileSharing/alerts/DeleteItemAlert';
import { useTranslation } from 'react-i18next';

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
  } = useFileManagerStore();

  useEffect(() => {
    fetchFiles().catch(console.error);
  }, [currentPath]);

  useEffect(() => {
    fetchFiles().catch(console.error);
  }, [fileOperationSuccessful]);
  const { t } = useTranslation();
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
        <div className="w-full md:w-auto md:max-w-7xl xl:max-w-full">
          <DataTable
            columns={Columns}
            data={files}
          />
        </div>

        <div className="fixed bottom-8 flex flex-row space-x-4 bg-opacity-90 p-4">
          <TooltipProvider>
            {selectedItems.length === 0 && (
              <>
                <ActionTooltip
                  onAction={() => {}}
                  tooltipText={t('tooltip.create.file')}
                  trigger={
                    <CreateNewContentDialog
                      trigger={
                        <HexagonButton onClick={() => {}}>
                          <MdOutlineNoteAdd className="font-bold text-white" />
                        </HexagonButton>
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
                        <HexagonButton onClick={() => {}}>
                          <HiOutlineFolderAdd className="font-bold text-white" />
                        </HexagonButton>
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
                        <HexagonButton onClick={() => {}}>
                          <FiUpload className="font-bold text-white" />
                        </HexagonButton>
                      }
                    />
                  }
                />
              </>
            )}
            {selectedItems.length > 0 && (
              <div className="flex flex-row space-x-4">
                <ActionTooltip
                  onAction={() => {}}
                  tooltipText={t('tooltip.move')}
                  trigger={
                    <HexagonButton onClick={() => {}}>
                      <MoveItemDialog
                        trigger={
                          <div>
                            <MdOutlineDriveFileMove className="font-bold text-white" />
                          </div>
                        }
                        item={selectedItems}
                      />
                    </HexagonButton>
                  }
                />

                <ActionTooltip
                  onAction={() => {}}
                  tooltipText={t('tooltip.delete')}
                  trigger={
                    <HexagonButton onClick={() => {}}>
                      <DeleteItemAlert
                        trigger={
                          <div>
                            <MdOutlineDeleteOutline className="font-bold text-white" />
                          </div>
                        }
                        file={selectedItems}
                      />
                    </HexagonButton>
                  }
                />
                <ActionTooltip
                  onAction={() => {
                    handleDownload(selectedItems).catch(() => {});
                  }}
                  tooltipText={t('tooltip.download')}
                  trigger={
                    <HexagonButton onClick={() => {}}>
                      <div>
                        <MdOutlineFileDownload className="text-white" />
                      </div>
                    </HexagonButton>
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
