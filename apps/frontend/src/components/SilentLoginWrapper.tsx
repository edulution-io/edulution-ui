import React from 'react';
import useSilentLogin from '@/hooks/useSilentLogin';
import usePlatformStore from '@/store/EduApiStore/usePlatformStore';

const SilentLoginWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isEdulutionApp = usePlatformStore((s) => s.isEdulutionApp);
  const { isCheckingAuth } = useSilentLogin();

  if (isEdulutionApp && isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return children;
};

export default SilentLoginWrapper;
