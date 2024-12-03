import { Connection } from 'mongoose';

const createCollectionBackup = async (
  connection: Connection,
  originCollectionName: string,
  targetCollectionName: string,
) => {
  await connection.dropCollection(targetCollectionName);
  await connection.createCollection(targetCollectionName);

  const docAtAggregationCursor = connection
    .collection(originCollectionName)
    .aggregate([{ $match: {} }, { $out: targetCollectionName }]);

  await docAtAggregationCursor.tryNext();
  await docAtAggregationCursor.close();
};

export default createCollectionBackup;
