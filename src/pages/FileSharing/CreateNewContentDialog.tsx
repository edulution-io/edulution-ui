import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogHeader,
} from "@/components/ui/dialog.tsx";

import React, {ReactNode, useState} from "react";
import {ContentType} from "../../../datatypes/filesystem.ts";
import {Button} from "@/components/ui/Button.tsx";
import {FileCreationForm} from "@/pages/FileSharing/FileCreationForm.tsx";
import {useFileManagerStore} from "@/store/appDataStore.ts";
import {DirectoryCreationForm} from "@/pages/FileSharing/DirectoryCreationForm.tsx";

interface CreateNewContentDialogProps {
    trigger: ReactNode;
    createContent: (path: string) => Promise<void>;
    contentType: ContentType
}

export const CreateNewContentDialog: React.FC<CreateNewContentDialogProps> = ({
                                                                                  trigger,
                                                                                  contentType,
                                                                                  createContent
                                                                              }) => {
    const [isOpen, setIsOpen] = useState(false);
    const fileName = useFileManagerStore((state) => state.fileName);
    const setFileName = useFileManagerStore((state) => state.setFileName);
    const directoryName = useFileManagerStore((state) => state.directoryName);
    const setDirectoryName = useFileManagerStore((state) => state.setDirectoryName);
    const handleCreateContent = () => {
        if (contentType === ContentType.file) {

            createContent(fileName);
            setIsOpen(false)
        } else {
            createContent(directoryName);
            setIsOpen(false)
        }
    }

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