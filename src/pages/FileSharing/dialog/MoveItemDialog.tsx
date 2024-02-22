import {FC, ReactNode, useEffect, useState} from "react";
import {ContentType, DirectoryFile} from "../../../../datatypes/filesystem.ts";
import {Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger} from "@/components/ui/dialog.tsx";
import {Label} from "@/components/ui/label.tsx";
import {getFileNameFromPath} from "@/utils/common.ts";
import {useWebDavActions} from "@/utils/webDavHooks.ts";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {ScrollArea} from "@/components/ui/scroll-area.tsx";
import {Button} from "@/components/shared/Button.tsx";
import {DirectoryBreadcrumb} from "@/pages/FileSharing/DirectoryBreadcrumb.tsx";
import {FaLongArrowAltRight} from "react-icons/fa";


interface MoveItemDialogProps {
    trigger: ReactNode,
    item: DirectoryFile | DirectoryFile[]
}

export const MoveItemDialog: FC<MoveItemDialogProps> = ({trigger, item}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState<DirectoryFile[]>([]);
    const [selectedRow, setSelectedRow] = useState<DirectoryFile>();
    const [currentPath, setCurrentPath] = useState("/");
    const {fetchDirectory} = useWebDavActions();

    useEffect(() => {
        if (isOpen) {
            fetchDirectory(currentPath).then(setItems).catch(console.error);
        }
    }, [currentPath, isOpen]);

    const handleBreadcrumbNavigate = (path: string) => {
        setCurrentPath(path)
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (open) {
            fetchDirectory(currentPath).then(setItems);
        }
    };

    const handleNextFolder = (item: DirectoryFile) => {
        if (item.type === ContentType.directory) {
            let newCurrentPath = currentPath;
            if (!newCurrentPath.endsWith("/")) {
                newCurrentPath += "/";
            }
            newCurrentPath += getFileNameFromPath(item.filename);

            setCurrentPath(newCurrentPath);
        }
    };


    const renderAvailablePaths = () => {
        return (
            <>
                <div>
                    <div className="flex space-x-2">
                        <p className="text-black mr-2">Current Directory:</p>
                        <DirectoryBreadcrumb path={currentPath}
                                             onNavigate={handleBreadcrumbNavigate}></DirectoryBreadcrumb>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">Folder Name</TableHead>
                            </TableRow>
                        </TableHeader>
                        <ScrollArea className="h-[200px]">
                            <TableBody>
                                {items.map((item) => (
                                    <TableRow
                                        key={item.filename}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setSelectedRow(item)
                                        }}
                                        style={{
                                            backgroundColor: selectedRow?.filename === item.filename ? "#f0f0f0" : "transparent",
                                            cursor: "pointer",
                                        }}
                                    >
                                        <TableCell>
                                            <div className="flex justify-between">
                                                <p>{getFileNameFromPath(item.filename)}</p>
                                                <Button
                                                    className="bg-gray-50"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleNextFolder(item);
                                                    }}>
                                                    <FaLongArrowAltRight/>
                                                </Button>
                                            </div>

                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </ScrollArea>
                    </Table>
                </div>
            </>
        );
    };

    const renderItemInfo = () => {
        const itemCount = Array.isArray(item) ? item.length : 1;
        const itemMessage = itemCount > 1 ? `Moving ${itemCount} items` : "Moving 1 item";

        return (
            <>
                <p className="pb-3.5">
                    {itemCount > 1 ? itemMessage : (
                        <div>
                            <div className="pb-2 justify space-x-2">
                                {itemMessage}: {getFileNameFromPath(!Array.isArray(item) ? item.filename : "")}
                            </div>
                        </div>
                    )}
                </p>
                {Array.isArray(item) && (
                    <ScrollArea className="h-[200px] w-[350px] rounded-md border p-4">
                        <div>
                            {item.map((item) => (
                                <p className="p-1" key={item.etag}>{getFileNameFromPath(item.filename)}</p>
                            ))}
                        </div>
                    </ScrollArea>
                )}
                <div>{renderAvailablePaths()}</div>
                <div className="flex justify-between pt-3">
                    <p className="pt-4">Move to: {selectedRow?.filename}</p>
                    <Button>Move</Button>
                </div>
            </>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogTitle>Change Directory</DialogTitle>
                <DialogDescription>
                    <Label>{renderItemInfo()}</Label>
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
};
