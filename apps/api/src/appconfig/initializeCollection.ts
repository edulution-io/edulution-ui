/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { Model, Connection } from 'mongoose';
import defaultAppConfig from '@libs/appconfig/constants/defaultAppConfig';
import { AppConfig } from './appconfig.schema';

const APP_CONFIG_COLLECTION_NAME = 'appconfigs';

const initializeCollection = async (connection: Connection, appConfigModel: Model<AppConfig>) => {
  const collections = await connection.db?.listCollections({ name: APP_CONFIG_COLLECTION_NAME }).toArray();

  if (collections?.length === 0) {
    await connection.db?.createCollection(APP_CONFIG_COLLECTION_NAME);
  }

  const count = await appConfigModel.countDocuments();
  if (count === 0) {
    await appConfigModel.insertMany(defaultAppConfig);
  }
};

export default initializeCollection;
