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
import { Scripts } from './script.type';
import keycloakConfigScripts from './keycloak/keycloakConfigScripts';

class ScriptService implements OnModuleInit {
  async onModuleInit() {
    await ScriptService.runScripts(keycloakConfigScripts);
  }

  static async runScripts(scripts: Scripts[]) {
    Logger.log(`Executing Scripts: ${scripts.length} scripts`, ScriptService.name);

    await scripts.reduce(async (prevPromise, script) => {
      await prevPromise;
      Logger.log(`Starting script "${script.name}"`, ScriptService.name);
      await script.execute();
      Logger.log(`Script "${script.name}" completed`, ScriptService.name);
    }, Promise.resolve());
  }
}

export default ScriptService;
