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

import { useCallback, useEffect, useRef, useState } from 'react';
import { UseFormWatch } from 'react-hook-form';
import McpConfigDto from '@libs/mcp/types/mcpConfigDto';
import McpConnectionTestResult from '@libs/mcp/types/mcpConnectionTestResult';
import MCP_CONFIG_TABLE_COLUMNS from '@libs/mcp/constants/mcpConfigTableColumns';
import useFetchMcpTools from './useFetchMcpTools';

interface UseMcpConnectionTestProps {
  watch: UseFormWatch<McpConfigDto>;
}

interface UseMcpConnectionTestReturn {
  isTesting: boolean;
  testResult: McpConnectionTestResult | null;
  testConnection: () => Promise<void>;
  resetTest: () => void;
}

const isValidUrl = (urlString: string): boolean => {
  try {
    return Boolean(new URL(urlString));
  } catch {
    return false;
  }
};

const useMcpConnectionTest = ({ watch }: UseMcpConnectionTestProps): UseMcpConnectionTestReturn => {
  const [testResult, setTestResult] = useState<McpConnectionTestResult | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTestedUrlRef = useRef<string | null>(null);

  const { fetchTools, isLoading, resetTools } = useFetchMcpTools();

  // Refs für stabile Funktionsreferenzen
  const fetchToolsRef = useRef(fetchTools);
  const resetToolsRef = useRef(resetTools);

  useEffect(() => {
    fetchToolsRef.current = fetchTools;
    resetToolsRef.current = resetTools;
  });

  const url = watch(MCP_CONFIG_TABLE_COLUMNS.URL);

  const resetTest = useCallback(() => {
    setTestResult(null);
    resetToolsRef.current();
    lastTestedUrlRef.current = null;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  const testConnection = useCallback(async () => {
    if (!url || url === lastTestedUrlRef.current) {
      return;
    }

    lastTestedUrlRef.current = url;
    const result = await fetchToolsRef.current(url);

    setTestResult({
      success: result.success,
      toolCount: result.tools.length,
      tools: result.tools,
    });
  }, [url]);

  useEffect(() => {
    const clearDebounce = () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };

    clearDebounce();

    if (!url) {
      resetTest();
      return clearDebounce;
    }

    if (url === lastTestedUrlRef.current) {
      return clearDebounce;
    }

    if (!isValidUrl(url)) {
      setTestResult({ success: false, toolCount: 0, tools: [] });
      return clearDebounce;
    }

    debounceTimerRef.current = setTimeout(() => {
      void testConnection();
    }, 500);

    return clearDebounce;
  }, [url, resetTest, testConnection]);

  useEffect(
    () => () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    },
    [],
  );

  return {
    isTesting: isLoading,
    testResult,
    testConnection,
    resetTest,
  };
};

export default useMcpConnectionTest;
