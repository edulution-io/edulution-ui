import { Injectable, OnModuleInit } from '@nestjs/common';
import connection from '@libs/common/migration/getDbConnection';
import APP_CONFIG_COLLECTION_NAME from '@libs/appconfig/migration/appconfig-collectionName';
import APP_CONFIG_MODULE_NAME from '@libs/appconfig/migration/appconfig-moduleName';
import migrateModule from '../common/migration/migrateModule';

@Injectable()
class AppConfigMigrationService implements OnModuleInit {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async onModuleInit() {
    await migrateModule(connection, APP_CONFIG_COLLECTION_NAME, APP_CONFIG_MODULE_NAME, AppConfigMigrationService.name);
  }
}

export default AppConfigMigrationService;
