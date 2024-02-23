import React, {useState} from 'react';
import {Dialog, DialogContent, DialogTitle, DialogTrigger} from '@/components/ui/dialog.tsx';
import {Button} from '@/components/shared/Button.tsx';
import {WebDavFileManager} from '@/webdavclient/WebDavFileManager.ts';
import {useFileManagerStore} from "@/store/appDataStore.ts";
import {DropZone, FileWithPreview} from "@/pages/FileSharing/utilities/DropZone.tsx";

interface UploadItemDialogProps {
    trigger: React.ReactNode;
}

export const UploadItemDialog: React.FC<UploadItemDialogProps> = ({trigger}) => {
    const currentPath = useFileManagerStore((state) => state.currentPath)
    const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const webDavFileManager = new WebDavFileManager();

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        setIsOpen(open);
        if (!open) {
            setSelectedFiles([]);
        }
    };

    const uploadFiles = async () => {
        for (const file of selectedFiles) {
            const remotePath = `${currentPath}/${file.name}`;
            try {
                await webDavFileManager.uploadFile(file, remotePath);
                console.log("Upload successful");
            } catch (error) {
                console.error("Upload failed", error);
            }
        }
        setIsOpen(false)
        setSelectedFiles([]);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogTitle>Upload Your Item</DialogTitle>
                <DropZone files={selectedFiles} setFiles={setSelectedFiles}/>
                {selectedFiles.length == 0 ? (
                    <Button disabled={selectedFiles.length > 5 || selectedFiles.length == 0}>Select
                        upto 5 items a time</Button>
                ) : (
                    <Button disabled={selectedFiles.length > 5 || selectedFiles.length == 0}
                            onClick={uploadFiles}>Upload: {selectedFiles.length} items</Button>
                )}
            </DialogContent>
        </Dialog>
    );
};