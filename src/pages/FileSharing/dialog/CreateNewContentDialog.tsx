import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog.tsx";

import React, {ReactNode, useState} from "react";
import {Button} from "@/components/ui/button.tsx";
import {useFileManagerStore} from "@/store/appDataStore.ts";
import {ContentType} from "../../../../datatypes/filesystem.ts";
import {FileCreationForm} from "@/pages/FileSharing/dialog/FileCreationForm.tsx";
import {DirectoryCreationForm} from "@/pages/FileSharing/dialog/DirectoryCreationForm.tsx";
import {useWebDavActions} from "@/utils/webDavHooks.ts";
import {WebDavFileManager} from "@/webdavclient/WebDavFileManager.ts";

interface CreateNewContentDialogProps {
    trigger: ReactNode;
    contentType: ContentType
    onSuccess: () => void;
    onFailure: () => void;
}

export const CreateNewContentDialog: React.FC<CreateNewContentDialogProps> = ({
                                                                                  trigger,
                                                                                  contentType,
                                                                                  onSuccess,
                                                                                  onFailure,
                                                                              }) => {

    const [isOpen, setIsOpen] = useState(false);
    const fileName = useFileManagerStore((state) => state.fileName);
    const setFileName = useFileManagerStore((state) => state.setFileName);
    const directoryName = useFileManagerStore((state) => state.directoryName);
    const setDirectoryName = useFileManagerStore((state) => state.setDirectoryName);

    const {currentPath, fetchFiles, handleWebDavAction} = useWebDavActions("/teachers/netzint-teacher");
    const webDavFileManager = new WebDavFileManager();

    const createFile = async (path: string): Promise<boolean> => {
        const isSuccess = await handleWebDavAction(() => webDavFileManager.createFile(currentPath + "/" + path));
        if (isSuccess) {
            await fetchFiles(currentPath);
        }
        return isSuccess;
    };

    const createDirectory = async (path: string): Promise<boolean> => {
        const isSuccess = await handleWebDavAction(() => webDavFileManager.createDirectory(currentPath + "/" + path));
        if (isSuccess) {
            await fetchFiles(currentPath);
        }
        return isSuccess;
    };

    const handleCreateContent = async () => {
        let success = false;
        if (contentType === ContentType.file) {
            success = await createFile(fileName);
        } else {
            success = await createDirectory(directoryName);
        }
        if (success) {
            setIsOpen(false);
            onSuccess();
        } else {
            setIsOpen(false);
            onFailure();
        }
    };


    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            setDirectoryName("")
            setFileName("")
            console.log("Dialog just closed.");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    {contentType === ContentType.file ? (
                        <>
                            <DialogTitle>Name your new File</DialogTitle>
                            <DialogDescription>
                                <FileCreationForm></FileCreationForm>
                            </DialogDescription>
                        </>
                    ) : (
                        <>
                            <DialogTitle>Create New Directory</DialogTitle>
                            <DialogDescription>
                                <DirectoryCreationForm></DirectoryCreationForm>
                            </DialogDescription>
                        </>
                    )}
                    <div className="container mx-auto p-4 flex justify-end">
                        <Button className="w-1/4 bg-blue-500 text-white py-2 px-4 rounded"
                                disabled={directoryName.length <= 0 && fileName.length <= 0}
                                onClick={handleCreateContent}>
                            Create
                        </Button>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};