import React from 'react';
import { useTranslation } from 'react-i18next';

interface ConnectionStatusProps {
  isTesting: boolean;
  testResult: { success: boolean; message: string } | null;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isTesting, testResult }) => {
  const { t } = useTranslation();

  if (isTesting) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        {t('aiconfig.settings.testingConnection')}
      </div>
    );
  }

  if (testResult) {
    return (
      <div className={`flex items-center gap-2 text-sm ${testResult.success ? 'text-green-500' : 'text-red-500'}`}>
        {testResult.message}
      </div>
    );
  }

  return null;
};

export default ConnectionStatus;