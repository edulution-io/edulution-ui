/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

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
