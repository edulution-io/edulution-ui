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

import { useState } from 'react';
import eduApi from '@/api/eduApi';
import { MCP_ENDPOINT } from '@libs/mcp/constants/mcpEndpoints';
import McpTool from '@libs/mcp/types/mcpTool';
import FetchMcpToolsResult from '@libs/chat/types/fetchMcpToolsResult';

const useFetchMcpTools = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [tools, setTools] = useState<McpTool[]>([]);

  const fetchTools = async (url: string): Promise<FetchMcpToolsResult> => {
    setIsLoading(true);
    try {
      const response = await eduApi.post<FetchMcpToolsResult>(`${MCP_ENDPOINT}/test-connection`, {
        url,
      });
      if (response.data.success) {
        setTools(response.data.tools);
      } else {
        setTools([]);
      }
      return response.data;
    } catch (err) {
      console.error('Failed to fetch MCP tools:', err);
      setTools([]);
      return { success: false, tools: [] };
    } finally {
      setIsLoading(false);
    }
  };

  const resetTools = () => {
    setTools([]);
  };

  return { fetchTools, tools, isLoading, resetTools };
};

export default useFetchMcpTools;
