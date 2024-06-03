import React, { useEffect } from 'react';
import {
  MdOutlineDeleteOutline,
  MdOutlineDriveFileMove,
  MdOutlineFileDownload,
  MdOutlineNoteAdd,
} from 'react-icons/md';
import useFileManagerStore from '@/pages/FileSharing/fileManagerStore';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { FiUpload } from 'react-icons/fi';
import { HiOutlineFolderAdd } from 'react-icons/hi';
import DirectoryBreadcrumb from '@/pages/FileSharing/DirectoryBreadcrumb';
import CreateNewContentDialog from '@/pages/FileSharing/dialog/CreateNewContentDialog';
import UploadItemDialog from '@/pages/FileSharing/dialog/UploadItemDialog';
import MoveItemDialog from '@/pages/FileSharing/dialog/MoveItemDialog';
import DataTable from '@/pages/FileSharing/table/DataTable';
import Columns from '@/pages/FileSharing/table/Columns';
import OperationsToaster from '@/pages/FileSharing/toast/OperationsToaster';
import { ContentType } from '@/datatypes/filesystem';
import DeleteItemAlert from '@/pages/FileSharing/dialog/DeleteItemAlert';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import Toaster from '@/components/ui/Sonner';
import { toast } from 'sonner';
import userStore from '@/store/userStore';
import useFileEditorStore from '@/pages/FileSharing/previews/documents/fileEditorStore.ts';
import Previews from '@/pages/FileSharing/previews/Previews.tsx';
import EditFile from '@/pages/FileSharing/previews/EditFile.tsx';
import { convertDownloadLinkToBlob } from '@/pages/FileSharing/previews/utilitys/utilitys.ts';
import { triggerFileDownload } from '@/pages/FileSharing/utilities/fileManagerUtilits.ts';
import FloatingActionButton from '@/components/ui/FloatingActionButton.tsx';

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

  return (
    <div className="flex h-full w-full flex-col">
      <div>{isVisible && <Toaster />}</div>
      {!editableFile ? (
        <div className="flex flex-1 flex-col overflow-hidden">
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
          <div className="flex flex-1 overflow-hidden">
            <div className={`w-full ${previewFile ? 'w-1/2' : ''} h-full overflow-y-auto`}>
              <DataTable
                columns={Columns}
                data={files}
              />
            </div>
            {previewFile && showEditor && (
              <div className="h-full w-1/2">
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

          <div className="fixed bottom-8 flex flex-row bg-opacity-90">
            <TooltipProvider>
              {selectedItems.length === 0 && (
                <>
                  <CreateNewContentDialog
                    trigger={
                      <FloatingActionButton
                        icon={MdOutlineNoteAdd}
                        text={t('tooltip.create.file')}
                      />
                    }
                    contentType={ContentType.file}
                  />
                  <CreateNewContentDialog
                    trigger={
                      <FloatingActionButton
                        icon={HiOutlineFolderAdd}
                        text={t('tooltip.create.folder')}
                      />
                    }
                    contentType={ContentType.directory}
                  />
                  <UploadItemDialog
                    trigger={
                      <FloatingActionButton
                        icon={FiUpload}
                        text={t('tooltip.upload')}
                      />
                    }
                  />
                </>
              )}
              {selectedItems.length > 0 && (
                <div className="flex flex-row space-x-24">
                  <MoveItemDialog
                    trigger={
                      <FloatingActionButton
                        icon={MdOutlineDriveFileMove}
                        text={t('tooltip.move')}
                      />
                    }
                    item={selectedItems}
                  />
                  <DeleteItemAlert
                    trigger={
                      <FloatingActionButton
                        icon={MdOutlineDeleteOutline}
                        text={t('tooltip.delete')}
                      />
                    }
                    file={selectedItems}
                  />

                  {selectedItems.length < 2 && (
                    <FloatingActionButton
                      icon={MdOutlineFileDownload}
                      text={t('tooltip.download')}
                      onClick={async () => {
                        const downloadUrl =
                          (await convertDownloadLinkToBlob((await downloadFile(selectedItems[0].filename)) || '')) ||
                          '';
                        triggerFileDownload(downloadUrl);
                      }}
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
