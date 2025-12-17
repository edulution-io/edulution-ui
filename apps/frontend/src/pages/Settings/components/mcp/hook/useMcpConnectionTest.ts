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
