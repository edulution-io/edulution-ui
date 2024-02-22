import React from "react";
import {Dialog, DialogContent, DialogDescription, DialogHeader,} from "@/components/ui/dialog.tsx";
import {CircleLoader} from "@/components/ui/circleLoader.tsx";

interface LoadPopUpProps {
    isOpen: boolean;
}

export const LoadPopUp: React.FC<LoadPopUpProps> = ({isOpen}) => {
    return (
        <Dialog open={isOpen}>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogDescription>
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <CircleLoader/>
                            <p>Please wait while we process your request...</p>
                        </div>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};
