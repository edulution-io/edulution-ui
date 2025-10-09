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

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Bulletin, BulletinSchema } from './bulletin.schema';
import BulletinBoardController from './bulletinboard.controller';
import BulletinBoardService from './bulletinboard.service';
import { BulletinCategory, BulletinCategorySchema } from '../bulletin-category/bulletin-category.schema';
import BulletinCategoryModule from '../bulletin-category/bulletin-category.module';
import GroupsModule from '../groups/groups.module';
import UserPreferencesModule from '../user-preferences/user-preferences.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bulletin.name, schema: BulletinSchema }]),
    MongooseModule.forFeature([{ name: BulletinCategory.name, schema: BulletinCategorySchema }]),
    BulletinCategoryModule,
    GroupsModule,
    UserPreferencesModule,
  ],
  controllers: [BulletinBoardController],
  providers: [BulletinBoardService],
  exports: [],
})
export default class BulletinBoardModule {}
