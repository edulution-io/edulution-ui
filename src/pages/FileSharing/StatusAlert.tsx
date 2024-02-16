import React, {useEffect, useState} from 'react';
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert.tsx";
import {Ban, PartyPopper} from "lucide-react";


interface AlertComponentProps {
    success: boolean
}

const AlertComponent: React.FC<AlertComponentProps> = ({success}) => {
    const [showAlert, setShowAlert] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowAlert(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    if (!showAlert) {
        return null;
    }

    return (
        <div className="alert-enter rounded-l-lg fixed top-0 right-0 w-1/4 z-50 shadow-md">
            {success && (
                <Alert className="bg-green-600">
                    <PartyPopper className="h-4 w-4"/><AlertTitle>'Heads up!'</AlertTitle><AlertDescription>
                    The Creation was successfull
                </AlertDescription>
                </Alert>

            )}
            {!success && (
                <Alert className="bg-red-600">
                    <Ban className="h-4 w-4"/><AlertTitle>'Failed'</AlertTitle><AlertDescription>
                    The Creation wasn´t successfull
                </AlertDescription>
                </Alert>
            )}
        </div>
    );
};

export default AlertComponent;
