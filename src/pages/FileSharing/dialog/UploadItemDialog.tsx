import React, {useRef, useState} from 'react';
import {Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger} from '@/components/ui/dialog.tsx';
import {Label} from '@/components/ui/label.tsx';
import {Button} from '@/components/shared/Button.tsx';
import {WebDavFileManager} from '@/webdavclient/WebDavFileManager.ts';
import {useFileManagerStore} from "@/store/appDataStore.ts";

interface UploadItemDialogProps {
    trigger: React.ReactNode;
}
export const UploadItemDialog: React.FC<UploadItemDialogProps> = ({ trigger }) => {
    const currentPath = useFileManagerStore((state) => state.currentPath)
    const [isOpen, setIsOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const webDavFileManager = new WebDavFileManager();

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);
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
                <DialogDescription>
                    <Label>Select a file to upload:</Label>
                    <input type="file" ref={fileInputRef}/>
                </DialogDescription>
                <Button onClick={uploadFile}>Upload</Button>
            </DialogContent>
        </Dialog>
    );
};