import React, { useEffect, useMemo } from 'react';
import {
  MdOutlineDeleteOutline,
  MdOutlineDriveFileMove,
  MdOutlineFileDownload,
  MdOutlineNoteAdd,
} from 'react-icons/md';
import useFileManagerStore from '@/pages/FileSharing/fileManagerStore';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { IconContext } from 'react-icons';
import { FiUpload } from 'react-icons/fi';
import { HiOutlineFolderAdd } from 'react-icons/hi';
import DirectoryBreadcrumb from '@/pages/FileSharing/DirectoryBreadcrumb';
import ActionTooltip from '@/pages/FileSharing/utilities/ActionTooltip';
import CreateNewContentDialog from '@/pages/FileSharing/dialog/CreateNewContentDialog';
import UploadItemDialog from '@/pages/FileSharing/dialog/UploadItemDialog';
import MoveItemDialog from '@/pages/FileSharing/dialog/MoveItemDialog';
import DataTable from '@/pages/FileSharing/table/DataTable';
import Columns from '@/pages/FileSharing/table/Columns';
import OperationsToaster from '@/pages/FileSharing/toast/OperationsToaster';
import { ContentType } from '@/datatypes/filesystem';
import DeleteItemAlert from '@/pages/FileSharing/alerts/DeleteItemAlert';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import { useSearchParams } from 'react-router-dom';
import Toaster from '@/components/ui/Sonner';
import { toast } from 'sonner';
import userStore from '@/store/userStore';
import useFileEditorStore from '@/pages/FileSharing/previews/documents/fileEditorStore.ts';
import Previews from '@/pages/FileSharing/previews/Previews.tsx';
import EditFile from '@/pages/FileSharing/previews/EditFile.tsx';
import { convertDownloadLinkToBlob } from '@/pages/FileSharing/previews/utilitys/utilitys.ts';
import { triggerFileDownload } from '@/pages/FileSharing/utilities/fileManagerUtilits.ts';

const FileSharingPage = () => {
  const {
    isVisible,
    downloadFile,
    fileOperationMessage,
    fileOperationSuccessful,
    selectedItems,
    files,
    currentPath,
    fetchFiles,
  } = useFileManagerStore();

  const { t } = useTranslation();
  const { previewFile, closeOnlyOfficeDocEditor, setShowEditor, showEditor } = useFileEditorStore();
  const { userInfo } = userStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const path = searchParams.get('path') || `/${userInfo?.ldapGroups?.role}s/${userInfo?.preferred_username}`;
  const editableFile = searchParams.get('editFile');
  if (path === '/') {
    searchParams.set('path', `/${userInfo?.ldapGroups?.role}/${userInfo?.preferred_username}`);
    setSearchParams(searchParams);
  }
  useEffect(() => {
    fetchFiles(path || '/').catch(console.error);
  }, [path]);

  useEffect(() => {
    if (isVisible) {
      if (fileOperationSuccessful) {
        toast.success(fileOperationMessage || t('operations.success'));
      } else {
        toast.error(fileOperationMessage || t('operations.failure'));
      }
    }
  }, [isVisible, fileOperationSuccessful, fileOperationMessage, t]);

  useEffect(() => {
    setShowEditor(true);
  }, [previewFile]);

  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8 m-5' }), []);

  return (
    <div className="w-full overflow-x-auto">
      <div>{isVisible && <Toaster />}</div>
      {!editableFile ? (
        <div className="flex-1 overflow-auto">
          <div className="flex w-full justify-between pb-3 pt-3">
            <TooltipProvider>
              <div className="flex flex-col ">
                <div className="flex space-x-2">
                  <DirectoryBreadcrumb
                    path={currentPath}
                    onNavigate={(filenamePath) => {
                      searchParams.set('path', filenamePath);
                      setSearchParams(searchParams);
                    }}
                    style={{ color: 'white' }}
                  />
                </div>
              </div>
            </TooltipProvider>
          </div>
          <div className="flex max-h-[70vh]">
            <div className={`w-full ${previewFile ? 'w-1/2' : ''}`}>
              <DataTable
                columns={Columns}
                data={files}
              />
            </div>
            {previewFile && showEditor && (
              <div className="w-1/2">
                <Previews
                  type={'desktop'}
                  file={previewFile}
                  mode={'view'}
                  onClose={closeOnlyOfficeDocEditor}
                  isPreview={true}
                />
              </div>
            )}
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
                  {selectedItems.length < 2 && (
                    <ActionTooltip
                      onAction={() => {}}
                      tooltipText={t('tooltip.download')}
                      trigger={
                        <Button
                          type="button"
                          variant="btn-hexagon"
                          className="fixed bottom-10 space-x-4 bg-opacity-90 p-4"
                          data-testid="test-id-file-sharing-page-download-button"
                          onClick={async () => {
                            const downloadUrl =
                              (await convertDownloadLinkToBlob(
                                (await downloadFile(selectedItems[0].filename)) || '',
                              )) || '';
                            triggerFileDownload(downloadUrl);
                          }}
                        >
                          <IconContext.Provider value={iconContextValue}>
                            <MdOutlineFileDownload />
                          </IconContext.Provider>
                        </Button>
                      }
                    />
                  )}
                </div>
              )}
            </TooltipProvider>
          </div>
          <OperationsToaster />
        </div>
      ) : (
        <EditFile />
      )}
    </div>
  );
};

export default FileSharingPage;
