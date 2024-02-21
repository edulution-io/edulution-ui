import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog.tsx";

interface LoadPopUpProps {
    isOpen: boolean;
}

export const LoadPopUp: React.FC<LoadPopUpProps> = ({ isOpen }) => {
    return (
        <Dialog open={isOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Loading...</DialogTitle>
                    <DialogDescription>
                        Please wait while we process your request.
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};
