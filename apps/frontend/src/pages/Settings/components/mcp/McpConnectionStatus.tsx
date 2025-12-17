import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Loader2, Wrench, XCircle } from 'lucide-react';
import McpConnectionTestResult from '@libs/mcp/types/mcpConnectionTestResult';

interface McpConnectionStatusProps {
  isTesting: boolean;
  testResult: McpConnectionTestResult | null;
  showToolList?: boolean;
}

const McpConnectionStatus: React.FC<McpConnectionStatusProps> = ({ isTesting, testResult, showToolList = false }) => {
  const { t } = useTranslation();

  if (isTesting) {
    return (
      <div className="flex items-center gap-2 text-sm text-ciLightGrey">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{t('mcpconfig.settings.testing')}</span>
      </div>
    );
  }

  if (!testResult) {
    return null;
  }

  if (testResult.success) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>{t('mcpconfig.settings.connected')}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-ciLightGrey">
          <Wrench className="h-4 w-4" />
          <span>{t('mcpconfig.settings.toolsFound', { count: testResult.toolCount })}</span>
        </div>

        {showToolList && testResult.tools.length > 0 && (
          <div className="mt-2 rounded-md bg-ciDarkGrey p-3">
            <p className="mb-2 text-xs font-semibold text-ciLightGrey">{t('mcpconfig.settings.availableTools')}:</p>
            <ul className="space-y-1">
              {testResult.tools.map((tool) => (
                <li
                  key={tool.name}
                  className="text-xs text-background"
                >
                  <span className="font-mono font-medium">{tool.name}</span>
                  {tool.description && <span className="ml-2 text-ciLightGrey">– {tool.description}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-red-500">
      <XCircle className="h-4 w-4" />
      <span>{t('mcpconfig.settings.connectionFailed')}</span>
    </div>
  );
};

export default McpConnectionStatus;
