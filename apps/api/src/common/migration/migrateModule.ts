import { Connection } from 'mongoose';
import { Logger } from '@nestjs/common';
import createDbBackup from '@libs/common/migration/createDbBackup';
import runMigration from '@libs/common/migration/runMigrations';

const migrateModule = async (
  connection: Connection,
  collectionName: string,
  moduleName: string,
  serviceName: string = 'DatabaseMigration',
) => {
  Logger.log(`⬆ ️⬆️ Migrating ${moduleName.toUpperCase()}`, serviceName);

  const backupCollectionName = `migration-backup-${collectionName}`;
  const migrationPath = `libs/src/${moduleName}/migration/`; // matches path in runMigration.sh

  try {
    Logger.log(`      ... creating a backup Before executing Migrations`, serviceName);
    await createDbBackup(connection, collectionName, backupCollectionName);
  } catch (e) {
    Logger.error(`      Error on creating Backup: ${e}`, serviceName);
    Logger.error('⬆ ️⛔ Stop migrating without any backup', serviceName);
    return;
  }

  try {
    Logger.log('      ... executing Migrations for AppConfigs', serviceName);
    runMigration(`${migrationPath}.migrate`, `${migrationPath}migrations`);
  } catch (e) {
    Logger.log(`      Error on executing Migrations: ${e}`, serviceName);
    Logger.log('      ... reverting replace with backup', serviceName);
    await createDbBackup(connection, backupCollectionName, collectionName);
    Logger.error('⬆ ️⛔️ Failure while running the migrations', serviceName);
    return;
  }

  Logger.log('⬆ ️✅️ Successfully executed the migrations', serviceName);
};

export default migrateModule;
