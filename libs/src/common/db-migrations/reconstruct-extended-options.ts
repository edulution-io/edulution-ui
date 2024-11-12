const { MongoClient } = require('mongodb');

async function migrate() {
  const uri = 'mongodb://your_mongo_uri';
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const database = client.db('your_database_name');
    const collection = database.collection('appconfigs');

    const cursor = collection.find({});
    while (await cursor.hasNext()) {
      const appConfig = await cursor.next();

      const updatedExtendedOptions = appConfig.extendedOptions.map((option) => {
        if (option.name === 'AppExtendedOptions.ONLY_OFFICE_URL') {
          return {
            ...option,
            name: 'appExtensionOnlyOffice.name',
            options: [
              {
                name: 'FileSharingAppExtensions.ONLY_OFFICE_URL',
                value: option.value,
                type: 'text',
                width: 'full',
              },
              {
                name: 'FileSharingAppExtensions.ONLY_OFFICE_JWT_SECRET',
                value: 'secret-key',
                type: 'text',
                width: 'full',
              },
            ],
          };
        }
        return option;
      });

      await collection.updateOne({ _id: appConfig._id }, { $set: { extendedOptions: updatedExtendedOptions } });
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await client.close();
  }
}
