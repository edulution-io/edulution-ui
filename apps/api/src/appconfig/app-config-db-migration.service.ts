import { Injectable, OnModuleInit } from '@nestjs/common';
import connection from '@libs/common/migration/getDbConnection';
import APP_CONFIG_COLLECTION_NAME from '@libs/appconfig/migration/appconfig-collectionName';
import migrateModule from '../common/migration/migrateModule';

@Injectable()
class AppConfigDbMigrationService implements OnModuleInit {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async onModuleInit() {
    await migrateModule(
      connection,
      APP_CONFIG_COLLECTION_NAME,
      'migration-backup-appconfigs',
      'libs/src/appconfig/migration/',
      'AppConfigs',
      AppConfigDbMigrationService.name,
    );
  }
}

export default AppConfigDbMigrationService;
