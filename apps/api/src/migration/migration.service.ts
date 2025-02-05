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

import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { Migration } from './migration.type';

@Injectable()
class MigrationService {
  static async runMigrations<MigrationModel>(model: Model<MigrationModel>, migrations: Migration<MigrationModel>[]) {
    Logger.log(`Executing ${model.modelName}: ${migrations.length} migrations`, MigrationService.name);

    await migrations.reduce(async (prevPromise, migration) => {
      await prevPromise;
      Logger.log(`Starting migration "${migration.name}"`, MigrationService.name);
      await migration.execute(model);
      Logger.log(`Migration "${migration.name}" completed`, MigrationService.name);
    }, Promise.resolve());
  }
}

export default MigrationService;
