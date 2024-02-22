import React, {useRef, useState} from 'react';
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const webDavFileManager = new WebDavFileManager();

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
        setIsOpen(open);
        if (!open) {
            setSelectedFiles([]);
        }
    };

    const uploadFile = async () => {
        if (fileInputRef.current?.files && fileInputRef.current.files.length > 0) {
            const file = fileInputRef.current.files[0];
            console.log(file)
            const remotePath = currentPath + "/" + file.name;
            try {
                await webDavFileManager.uploadFile(file, remotePath);
                console.log("Upload successful");
            } catch (error) {
                console.error("Upload failed", error);
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogTitle>Upload Your Item</DialogTitle>
                <DropZone files={selectedFiles} setFiles={setSelectedFiles}/>
                {selectedFiles.length == 0 ? (
                    <Button disabled={selectedFiles.length > 5 || selectedFiles.length == 0} onClick={uploadFile}>Select
                        upto 5 items a time</Button>
                ) : (
                    <Button disabled={selectedFiles.length > 5 || selectedFiles.length == 0}
                            onClick={uploadFile}>Upload: {selectedFiles.length} items</Button>
                )}
            </DialogContent>
        </Dialog>
    );
};