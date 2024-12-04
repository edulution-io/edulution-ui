import { Model, Connection } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import initializeCollection from './initializeCollection';
import { AppConfig } from './appconfig.schema';

@Injectable()
class AppConfigMigrationService implements OnModuleInit {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(AppConfig.name) private readonly appConfigModel: Model<AppConfig>,
  ) {}

  async onModuleInit() {
    await initializeCollection(this.connection, this.appConfigModel);

    Logger.log(`⬆ ️⬆️ Migrating`, AppConfigMigrationService.name);

    Logger.log('⬆ ... executing Migrations', AppConfigMigrationService.name);

    try {
      await this.migrate000();
    } catch (e) {
      Logger.error('⬆ ️⛔️ Failure while running the migrations', AppConfigMigrationService.name);
    }

    Logger.log('⬆ ️✅️ Successfully executed the migrations', AppConfigMigrationService.name);
  }

  async migrate000() {
    const migrationName = '000-add-db-version-number';
    const previousMigrationNumber = undefined;
    const newMigrationNumber = 0;

    const unprocessedDocuments = await this.appConfigModel.find({ migrationNumber: previousMigrationNumber });
    if (unprocessedDocuments.length === 0) {
      Logger.log(`⬆ Skipped ${migrationName} (no document needs to be updated)`, AppConfigMigrationService.name);
      return;
    }

    // eslint-disable-next-line no-underscore-dangle
    const ids = unprocessedDocuments.map((d) => d._id);

    try {
      await this.appConfigModel.updateMany(
        { _id: { $in: ids } },
        {
          $set: {
            migrationNumber: newMigrationNumber,
            updatedAt: new Date().toDateString(),
          },
        },
      );
      Logger.log(`⬆ Migration "${migrationName}" was successfully completed.`, AppConfigMigrationService.name);
    } catch (e) {
      Logger.error(`⬆     Error while running Migration "${migrationName}": ${e}`, AppConfigMigrationService.name);
      throw e;
    }
  }
}

export default AppConfigMigrationService;
