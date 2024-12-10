import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { Migration, MigrationModels } from './migration.type';

@Injectable()
class MigrationService {
  static async runMigrations(model: Model<MigrationModels>, migrations: Migration<MigrationModels>[]) {
    Logger.log(`⬆ Executing ${model.modelName}: ${migrations.length} migrations`);

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
