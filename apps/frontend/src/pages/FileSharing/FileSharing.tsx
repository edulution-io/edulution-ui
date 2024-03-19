import React, {useEffect} from 'react';
import {MdOutlineDeleteOutline, MdOutlineDriveFileMove, MdOutlineFileDownload, MdOutlineNoteAdd,} from 'react-icons/md';
import useFileManagerStore from "@/store/fileManagerStore"
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import {TooltipProvider} from '@/components/ui/tooltip';
import {FiUpload} from 'react-icons/fi';
import {HiOutlineFolderAdd} from 'react-icons/hi';
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
import {ContentType} from '@/datatypes/filesystem';
import HexagonButton from '@/components/shared/HexagonButton';

const FileSharing = () => {
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
        currentPath
    } = useFileManagerStore();
    useEffect(() => {
        fetchFiles().catch(console.error);
    }, [currentPath]);


    useEffect(() => {
        fetchFiles().catch(console.error);
    }, [fileOperationSuccessful]);

    return (
        <div className="  w-full overflow-x-auto">
            <div>
                {isLoading && <LoadingIndicator isOpen={isLoading}/>}
                {isVisible && (
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
                                            setCurrentPath(path);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                {selectedItems.length === 0 && (
                                    <>
                                        <ActionTooltip
                                            onAction={() => {
                                            }}
                                            tooltipText="Add File"
                                            trigger={
                                                <CreateNewContentDialog
                                                    trigger={
                                                        <HexagonButton onClick={() => {
                                                        }}>
                                                            <MdOutlineNoteAdd className="font-bold text-white"/>
                                                        </HexagonButton>
                                                    }
                                                    contentType={ContentType.file}
                                                />
                                            }
                                        />
                                        <ActionTooltip
                                            onAction={() => {
                                            }}
                                            tooltipText="Add Folder"
                                            trigger={
                                                <CreateNewContentDialog
                                                    trigger={
                                                        <HexagonButton onClick={() => {
                                                        }}>
                                                            <HiOutlineFolderAdd className="font-bold text-white"/>
                                                        </HexagonButton>
                                                    }
                                                    contentType={ContentType.directory}
                                                />
                                            }
                                        />
                                        <ActionTooltip
                                            onAction={() => {
                                            }}
                                            tooltipText="Upload item"
                                            trigger={
                                                <UploadItemDialog
                                                    trigger={
                                                        <HexagonButton onClick={() => {
                                                        }}>
                                                            <FiUpload className="font-bold text-white"/>
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
                                            onAction={() => {
                                            }}
                                            tooltipText="Upload item"
                                            trigger={
                                                <HexagonButton onClick={() => {
                                                        }}>
                                                  <MoveItemDialog
                                                      trigger={
                                                          <div>
                                                              <MdOutlineDriveFileMove className="font-bold text-white"/>
                                                          </div>
                                                      }
                                                      item={selectedItems}
                                                  />
                                                    </HexagonButton>
                                            }
                                        />

                                        <ActionTooltip
                                            onAction={() => {
                                            }}
                                            tooltipText="Upload item"
                                            trigger={
                                              <HexagonButton onClick={() => {
                                                        }}>
                                                <DeleteAlert
                                                    trigger={
                                                        <div>
                                                            <MdOutlineDeleteOutline className="font-bold text-white"/>
                                                        </div>
                                                    }
                                                    file={selectedItems}
                                                />
                                              </HexagonButton>
                                            }
                                        />
                                        <ActionTooltip
                                            onAction={() => {
                                                handleDownload(selectedItems).catch(() => {
                                                });
                                            }}
                                            tooltipText="Download Selected Items"

                                            trigger={
                                              <HexagonButton onClick={() => {}}>
                                                <div>
                                                    <MdOutlineFileDownload className="text-white"/>
                                                </div>
                                              </HexagonButton>
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
                    <UploadToast/>
                </div>
            </div>
        </div>
    );
};

export default FileSharing;
