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

    Logger.log('All migrations successfully executed', MigrationService.name);
  }
}

export default MigrationService;
