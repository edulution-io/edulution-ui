import { Migration } from './migration.type';
import migration000 from './migration000';

const createMigrationList = <T>(): Migration<T>[] => [migration000 as unknown as Migration<T>];

export default createMigrationList;
