import React, { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Ban, PartyPopper } from 'lucide-react';

interface StatusAlertProps {
  success: boolean | undefined;
  message: string;
}

const StatusAlert: React.FC<StatusAlertProps> = ({ success, message }) => {
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
    <div className="alert-enter fixed right-0 top-0 z-50 w-1/4 rounded-l-lg shadow-md">
      {success && (
        <Alert className="bg-green-600">
          <PartyPopper className="h-4 w-4" />
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
      {!success && (
        <Alert className="bg-red-600">
          <Ban className="h-4 w-4" />
          <AlertTitle>Failed</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default StatusAlert;
