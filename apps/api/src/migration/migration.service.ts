import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import createMigrationList from './createMigrationList';
import { MigrationModels } from './migration.type';

@Injectable()
class MigrationService {
  static async runMigrations(model: Model<MigrationModels>) {
    const migrations = createMigrationList<MigrationModels>();
    Logger.log(`⬆ Executing ${migrations.length} migrations`);

    await migrations.reduce(async (prevPromise, migration) => {
      await prevPromise;
      Logger.log(`⬆ Starting migration "${migration.name}"`);
      await migration.execute(model);
      Logger.log(`⬆ Migration "${migration.name}" completed`);
    }, Promise.resolve());

    Logger.log('⬆ All migrations successfully executed');
  }
}

export default MigrationService;
