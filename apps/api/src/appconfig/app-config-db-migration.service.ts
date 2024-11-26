import { load } from 'migrate';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
class AppConfigDbMigrationService implements OnModuleInit {
  onModuleInit() {
    load(
      {
        stateStore: '.migrate',
        migrationsDirectory: 'libs/src/appconfig/migration/migrations',
      },
      (error, set) => {
        if (error) {
          console.error(error);
          process.exit(1);
        }

        set.up((err) => {
          if (err) {
            console.error(err);
            process.exit(1);
          }
        });
      },
    );
  }
}

export default AppConfigDbMigrationService;
