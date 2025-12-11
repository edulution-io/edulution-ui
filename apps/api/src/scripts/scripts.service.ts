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

import { Logger, OnModuleInit } from '@nestjs/common';
import { Timeout } from '@nestjs/schedule';
import { Scripts } from './script.type';
import keycloakConfigScripts from './keycloak/keycloakConfigScripts';
import { KEYCLOAK_STARTUP_TIMEOUT_MS } from '@libs/ldapKeycloakSync/constants/keycloakSyncValues';

class ScriptsService implements OnModuleInit {
  async onModuleInit() {
    Logger.log('ScriptService initialized. Wait 60s for Keycloak to be ready', ScriptsService.name);
  }

  @Timeout(KEYCLOAK_STARTUP_TIMEOUT_MS)
  handleTimeout() {
    void this.runScripts(keycloakConfigScripts);
  }

  private async runScripts(scripts: Scripts[]) {
    Logger.log(`Executing Scripts: ${scripts.length} scripts`, ScriptsService.name);

    for (const script of scripts) {
      Logger.log(`Starting script "${script.name}"`, ScriptsService.name);
      await script.execute();
      Logger.log(`Script "${script.name}" completed`, ScriptsService.name);
    }
  }
}

export default ScriptsService;
