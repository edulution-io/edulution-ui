/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { Logger, OnModuleInit } from '@nestjs/common';
import { Timeout } from '@nestjs/schedule';
import { Scripts } from './script.type';
import keycloakConfigScripts from './keycloak/keycloakConfigScripts';

class ScriptsService implements OnModuleInit {
  async onModuleInit() {
    Logger.log('ScriptService initialized. Wait 60s for Keycloak to be ready', ScriptsService.name);
  }

  @Timeout(60_000)
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
