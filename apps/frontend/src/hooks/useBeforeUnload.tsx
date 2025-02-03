import { useEffect } from 'react';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';

const useBeforeUnload = (message: string, onUnload?: (fileToPreview: DirectoryFileDTO | null) => void) => {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const e = event || window.event;
      if (e) {
        e.preventDefault();
        e.returnValue = message;
      }
      return message;
    };
    const handleUnload = () => {
      if (onUnload) {
        onUnload(null);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, [message, onUnload]);
};

export default useBeforeUnload;
