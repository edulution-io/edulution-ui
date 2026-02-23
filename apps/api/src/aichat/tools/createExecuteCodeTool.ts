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

import { Logger } from '@nestjs/common';
import axios from 'axios';
import { tool } from 'ai';
import { z } from 'zod';

const EXECUTE_CODE_LOG_CONTEXT = 'ExecuteCodeTool';

const PISTON_VERSIONS: Record<string, string> = {
  python: '3.10.0',
  node: '18.15.0',
};

interface PistonRunResult {
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
  };
}

const createExecuteCodeTool = (pistonUrl: string) =>
  tool({
    description:
      'Execute Python or JavaScript code in a secure sandboxed environment. Use this to run calculations, data processing, test code snippets, or verify solutions.',
    inputSchema: z.object({
      language: z.enum(['python', 'node']).describe('Programming language to use'),
      code: z.string().describe('The code to execute'),
      stdin: z.string().optional().describe('Input to pass to the program via stdin'),
    }),
    execute: async ({ language, code, stdin }) => {
      try {
        const baseUrl = pistonUrl.replace(/\/+$/, '');
        const response = await axios.post<PistonRunResult>(`${baseUrl}/api/v2/execute`, {
          language,
          version: PISTON_VERSIONS[language],
          files: [{ content: code }],
          ...(stdin ? { stdin } : {}),
        });

        const { run } = response.data;
        return {
          stdout: run.stdout,
          stderr: run.stderr,
          exitCode: run.code,
          signal: run.signal,
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          Logger.error(
            `Piston execution failed: ${error.response?.status} ${error.response?.statusText} - URL: ${error.config?.url}`,
            EXECUTE_CODE_LOG_CONTEXT,
          );
        } else {
          Logger.error(`Piston execution failed: ${error}`, EXECUTE_CODE_LOG_CONTEXT);
        }
        return {
          stdout: '',
          stderr: 'Code execution failed: sandbox service unavailable',
          exitCode: 1,
          signal: null,
        };
      }
    },
  });

export default createExecuteCodeTool;
