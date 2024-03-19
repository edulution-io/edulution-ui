import React, {FC, ReactNode, useEffect, useState} from 'react';
import {Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import Label from '@/components/ui/label';
import {getFileNameFromPath} from '@/utils/common';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Button} from '@/components/shared/Button';
import DirectoryBreadcrumb from '@/pages/FileSharing/DirectoryBreadcrumb';
import WebDavFunctions from '@/webdavclient/WebDavFileManager';
import useFileManagerStore from "@/store/fileManagerStore"
import {ContentType, DirectoryFile} from '@/datatypes/filesystem';

interface MoveItemDialogProps {
    trigger: ReactNode;
    item: DirectoryFile | DirectoryFile[];
}

const MoveItemDialog: FC<MoveItemDialogProps> = ({trigger, item}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [directorys, setDirectorys] = useState<DirectoryFile[]>([]);
    const [selectedRow, setSelectedRow] = useState<DirectoryFile>();
    const [currentPath, setCurrentPath] = useState('/teachers/netzint-teacher');
    const {
        setFileOperationSuccessful,
        fetchDirectory
    } = useFileManagerStore()
    useEffect(() => {
        if (isOpen) {
            fetchDirectory(currentPath)
                .then(setDirectorys)
                .catch(() => null);
        }
    }, [currentPath, isOpen]);

    const handleBreadcrumbNavigate = (path: string) => {
        setCurrentPath(path);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            fetchDirectory(currentPath)
                .then(setDirectorys)
                .catch(() => null);
        }
    };

    const handleNextFolder = (nextItem: DirectoryFile) => {
        if (nextItem.type === ContentType.directory) {
            let newCurrentPath = currentPath;
            if (!newCurrentPath.endsWith('/')) {
                newCurrentPath += '/';
            }
            newCurrentPath += getFileNameFromPath(nextItem.filename);

            setCurrentPath(newCurrentPath);
        }
    };

    const moveItem = async (items: DirectoryFile | DirectoryFile[], toPath: string | undefined) => {
        await WebDavFunctions.moveItems(items, toPath)
            .then((resp) => {
                if ('message' in resp) {
                    setFileOperationSuccessful(resp.success, resp.message);
                } else {
                    setFileOperationSuccessful(resp.success, '');
                }
            })
            .catch((error: unknown) => {
                const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
                setFileOperationSuccessful(false, errorMessage);
            });
        setIsOpen(false);
    };

    const renderAvailablePaths = () => (
        <div>
            <div className="flex space-x-2">
                <p className="mr-2 text-black">Current Directory:</p>
                <DirectoryBreadcrumb
                    path={currentPath}
                    onNavigate={handleBreadcrumbNavigate}
                />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Folder Name</TableHead>
                    </TableRow>
                </TableHeader>
                <ScrollArea className="h-[200px]">
                    <TableBody className="flex w-full flex-col">
                        {directorys.map((row) => (
                            <TableRow
                                key={row.filename}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setSelectedRow(row);
                                }}
                                onDoubleClick={(event) => {
                                    event.stopPropagation();
                                    handleNextFolder(row);
                                }}
                                style={{
                                    backgroundColor: selectedRow?.filename === row.filename ? '#f0f0f0' : 'transparent',
                                    cursor: 'pointer',
                                }}
                            >
                                <TableCell>
                                    <div className="flex flex-row justify-between space-x-4">
                                        <p>{getFileNameFromPath(row.filename)}</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </ScrollArea>
            </Table>
        </div>
    );

    const renderItemInfo = () => {
        const itemCount = Array.isArray(item) ? item.length : 1;
        const itemMessage = itemCount > 1 ? `Moving ${itemCount} items` : 'Moving 1 item';

        return (
            <>
                <div className="pb-3.5">
                    {itemCount > 1 ? (
                        <p className="text-black">{itemMessage}</p>
                    ) : (
                        <div>
                            <div className="justify space-x-2 pb-2">
                                <p>
                                    {itemMessage}: {getFileNameFromPath(!Array.isArray(item) ? item.filename : '')}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {Array.isArray(item) && (
                    <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
                        <div className="text-black">
                            {item.map((files) => (
                                <p
                                    className="p-1"
                                    key={files.etag}
                                >
                                    {getFileNameFromPath(files.filename)}
                                </p>
                            ))}
                        </div>
                    </ScrollArea>
                )}
                <div>{renderAvailablePaths()}</div>
                <div className="flex justify-between pt-3 text-black">
                    <p className="pt-4">Move to: {selectedRow?.filename}</p>
                    {selectedRow !== undefined ? (
                        <Button
                            className="bg-green-600"
                            onClick={() => {
                                moveItem(item, selectedRow?.filename).catch(() => null);
                            }}
                        >
                            Move
                        </Button>
                    ) : (
                        <Button className="bg-green-600" disabled>Move</Button>
                    )}
                </div>
            </>
        );
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={handleOpenChange}
        >
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogTitle>Change Directory</DialogTitle>
                <DialogDescription>
                    <Label>
                        <p>{renderItemInfo()}</p>
                    </Label>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
};

export default MoveItemDialog;
