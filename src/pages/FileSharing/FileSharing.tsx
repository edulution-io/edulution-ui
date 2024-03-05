import React, { useEffect, useState } from 'react';
import {
  MdOutlineDeleteOutline,
  MdOutlineDriveFileMove,
  MdOutlineFileDownload,
  MdOutlineNoteAdd,
} from 'react-icons/md';
import { useFileManagerStore } from '@/store/appDataStore';
import useWebDavActions from '@/utils/webDavHooks';
import WebDavFunctions from '@/webdavclient/WebDavFileManager';
import LoadPopUp from '@/components/shared/LoadPopUp';
import { TooltipProvider } from '@/components/ui/tooltip';
import { FiUpload } from 'react-icons/fi';
import { HiOutlineFolderAdd } from 'react-icons/hi';
import StatusAlert from '@/pages/FileSharing/alerts/StatusAlert';
import DirectoryBreadcrumb from '@/pages/FileSharing/DirectoryBreadcrumb';
import ActionTooltip from '@/pages/FileSharing/utilities/ActionTooltip';
import CreateNewContentDialog from '@/pages/FileSharing/dialog/CreateNewContentDialog';
import UploadItemDialog from '@/pages/FileSharing/dialog/UploadItemDialog';
import MoveItemDialog from '@/pages/FileSharing/dialog/MoveItemDialog';
import DeleteAlert from '@/pages/FileSharing/alerts/DeleteAlert';
import DataTable from '@/pages/FileSharing/table/DataTable';
import Columns from '@/pages/FileSharing/table/Columns';
import UploadToast from '@/pages/FileSharing/toast/UploadToast';
import { ContentType, DirectoryFile } from '@/datatypes/filesystem';
import HexagonButton from '@/components/shared/HexagonButton';

const FileSharing = () => {
  const { files, currentPath, fetchFiles } = useWebDavActions();
  // const [mountPoints, setMountPoints] = useState<DirectoryFile[]>([]);
  const selectedItems: DirectoryFile[] = useFileManagerStore((state) => state.selectedItems);
  const fileOperationSuccessful: boolean = useFileManagerStore((state) => state.fileOperationSuccessful);
  const fileOperationMessage: string = useFileManagerStore((state) => state.fileOperationMessage);

  const [showPopUp, setShowPopUp] = useState<boolean>(false);
  const [showLoadingPopUp, setShowLoadingPopUp] = useState<boolean>(false);

  useEffect(() => {
    fetchFiles().catch(console.error);
  }, [currentPath]);

  const handleDownload = async (items: DirectoryFile[]) => {
    setShowLoadingPopUp(true);
    try {
      await WebDavFunctions.triggerMultipleFolderDownload(items);
    } catch {
      /* empty */
    } finally {
      setShowLoadingPopUp(false);
      setShowPopUp(true);

      const timer = setTimeout(() => setShowPopUp(false), 3000);
      clearTimeout(timer);
    }
  };

  useEffect(() => {
    if (fileOperationSuccessful !== undefined) {
      setShowPopUp(true);
      fetchFiles().catch(console.error);
      const timer = setTimeout(() => {
        setShowPopUp(false);
      }, 3000);
      const resetTimer = setTimeout(() => {
        // setFileOperationSuccessful(undefined);
      }, 3500);

      return () => {
        clearTimeout(timer);
        clearTimeout(resetTimer);
      };
    }
    return () => {};
  }, [fileOperationSuccessful]);

  // const menuItems: {
  //   action: () => Promise<void>;
  //   label: string;
  //   IconComponent: (props: IconBaseProps) => JSX.Element;
  // }[] = mountPoints.map((mountPoint) => ({
  //   label: getFileNameFromPath(mountPoint.filename),
  //   IconComponent: MdOutlineNoteAdd,
  //   action: () => fetchFiles(mountPoint.filename),
  // }));

  return (
    <div className="  w-full overflow-x-auto">
      <div>
        {showLoadingPopUp && <LoadPopUp isOpen={showLoadingPopUp} />}
        {showPopUp && (
          <StatusAlert
            success={fileOperationSuccessful}
            message={fileOperationMessage}
          />
        )}
      </div>
      <div>
        <div className="container  flex-1 justify-between overflow-auto pl-3 pr-3.5">
          <div className="flex w-full justify-between pb-3 pt-3">
            <TooltipProvider>
              <div className="flex flex-col ">
                <div className="flex space-x-2">
                  <p className="mr-2 text-white">Current Directory:</p>
                  <DirectoryBreadcrumb
                    path={currentPath}
                    onNavigate={(path) => {
                      fetchFiles(path).catch((error) => {
                        console.error('Something went wrong:', error);
                      });
                    }}
                  />
                </div>
              </div>
              <div className="flex space-x-4">
                {selectedItems.length === 0 && (
                  <>
                    <ActionTooltip
                      onAction={() => {}}
                      tooltipText="Add File"
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
                      tooltipText="Add Folder"
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
                      tooltipText="Upload item"
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
                  <div>
                    <ActionTooltip
                      onAction={() => {}}
                      tooltipText="Upload item"
                      trigger={
                        <MoveItemDialog
                          trigger={
                            <div>
                              <MdOutlineDriveFileMove className="font-bold text-white" />
                            </div>
                          }
                          item={selectedItems}
                        />
                      }
                    />

                    <ActionTooltip
                      onAction={() => {}}
                      tooltipText="Upload item"
                      trigger={
                        <DeleteAlert
                          trigger={
                            <div>
                              <MdOutlineDeleteOutline className="font-bold text-white" />
                            </div>
                          }
                          file={selectedItems}
                        />
                      }
                    />
                    <ActionTooltip
                      onAction={() => {
                        handleDownload(selectedItems).catch(() => {});
                      }}
                      tooltipText="Download Selected Items"
                      trigger={
                        <div>
                          <MdOutlineFileDownload className="text-white" />
                        </div>
                      }
                    />
                  </div>
                )}
              </div>
            </TooltipProvider>
          </div>
          <div className="mx-auto w-full  py-10">
            <DataTable
              columns={Columns}
              data={files}
            />
          </div>
          <UploadToast />
        </div>
      </div>
    </div>
  );
};

export default FileSharing;
