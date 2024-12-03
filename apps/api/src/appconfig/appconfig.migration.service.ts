import { Model, Connection } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import createCollectionBackup from '@libs/common/utils/createCollectionBackup';
import APP_CONFIG_COLLECTION_NAME from '@libs/appconfig/constants/appConfig-collectionName';
import initializeCollection from './initializeCollection';
import runMigration from './migrate/runMigration';
import revertMigration from './migrate/revertMigration';
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

    try {
      Logger.log(`⬆     ... creating a backup Before executing Migrations`, AppConfigMigrationService.name);
      await createCollectionBackup(
        this.connection,
        APP_CONFIG_COLLECTION_NAME,
        `migration-backup-${APP_CONFIG_COLLECTION_NAME}`,
      );
    } catch (e) {
      Logger.error(`⬆     Error on creating Backup: ${e}`, AppConfigMigrationService.name);
      Logger.error('⬆ ️⛔ Stop migrating without any backup', AppConfigMigrationService.name);
      throw e;
    }

    let shouldDowngrade: undefined | boolean;
    try {
      Logger.log('⬆     ... executing Migrations', AppConfigMigrationService.name);
      await runMigration(this.appConfigModel, AppConfigMigrationService.name);
      Logger.log('⬆ ️✅️ Successfully executed the migrations', AppConfigMigrationService.name);
      return;
    } catch (e) {
      shouldDowngrade = true;
      Logger.error('⬆ ️⛔️ Failure while running the migrations', AppConfigMigrationService.name);
    }

    let shouldOverwriteWithBackup: undefined | boolean;
    if (shouldDowngrade) {
      try {
        Logger.log('      ... reverting Migrations', AppConfigMigrationService.name);
        await revertMigration(this.appConfigModel, AppConfigMigrationService.name);
        Logger.error('⬆ ️⛔️ Reverted the migrations after an Error was received', AppConfigMigrationService.name);
        return;
      } catch (e) {
        shouldOverwriteWithBackup = true;
        Logger.error('⬆ ️⛔️ Failure while reverting the migrations', AppConfigMigrationService.name);
      }
    }

    if (shouldOverwriteWithBackup) {
      try {
        Logger.log(
          `      ... restore data from the backup Before executing Migrations`,
          AppConfigMigrationService.name,
        );
        await createCollectionBackup(
          this.connection,
          `migration-backup-${APP_CONFIG_COLLECTION_NAME}`,
          APP_CONFIG_COLLECTION_NAME,
        );
      } catch (e) {
        Logger.error(
          '⬆ ️⛔️ Failure while resetting the database, it could be corrupted! ⛔',
          AppConfigMigrationService.name,
        );
      }
    }
  }
}

export default AppConfigMigrationService;
