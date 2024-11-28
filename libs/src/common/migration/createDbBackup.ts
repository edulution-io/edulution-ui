import { Connection } from 'mongoose';

const createDbBackup = async (connection: Connection, collectionName: string, backupName: string) => {
  await connection.dropCollection(backupName);
  await connection.createCollection(backupName);

  const docAtAggregationCursor = connection
    .collection(collectionName)
    .aggregate([{ $match: {} }, { $out: backupName }]);

  await docAtAggregationCursor.tryNext();
  await docAtAggregationCursor.close();
};

export default createDbBackup;
