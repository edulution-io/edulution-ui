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

import { Injectable } from '@nestjs/common';
import { Tool } from '@rekog/mcp-nest';
import { z } from 'zod';
import BaseTool from './base.tool';

@Injectable()
class GreetingTool extends BaseTool {
  @Tool({
    name: 'whoami',
    description: 'Returns info about the current user',
    parameters: z.object({}),
  })
  whoAmI() {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              name: this.user?.name,
              username: this.user?.name,
              email: this.user?.email,
              school: this.user?.school,
              isTeacher: this.isTeacher,
              isAdmin: this.isAdmin,
              token: this.token,
            },
            null,
            2,
          ),
        },
      ],
    };
  }
}

export default GreetingTool;
