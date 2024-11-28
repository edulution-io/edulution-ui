import { load } from 'migrate';

const runMigration = (stateStore: string, migrationsDirectory: string) =>
  load(
    {
      stateStore,
      migrationsDirectory,
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

export default runMigration;
