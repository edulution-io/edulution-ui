import { Logger } from '@nestjs/common';
import migrationReconstructOptionsAndExtendedOptions from './appconfig/db-migrations/migration_reconstruct_options_and_extended_options';

const runMigrationScripts = async (): Promise<void> => {
  Logger.log(`Executing applying migration scripts`, 'Migration');

  try {
    // TODO: Remove this migration file after applying plus some additional time (field testing)(Delete on 04.04.2025)
    await migrationReconstructOptionsAndExtendedOptions();
  } catch (e) {
    Logger.error(`Error during migration of 000-AppConfig-Merge-options-and-extendedOptions:`, 'Migration');
    Logger.error(`    Migration-Error: ${e}`, 'Migration');
  }

  Logger.log('Finished executing migration scripts', 'Migration');
};

export default runMigrationScripts;
