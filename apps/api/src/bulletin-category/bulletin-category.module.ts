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
import BulletinCategoryController from './bulletin-category.controller';
import BulletinCategoryService from './bulletin-category.service';
import { BulletinCategory, BulletinCategorySchema } from './bulletin-category.schema';
import { Bulletin, BulletinSchema } from '../bulletinboard/bulletin.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bulletin.name, schema: BulletinSchema }]),
    MongooseModule.forFeature([{ name: BulletinCategory.name, schema: BulletinCategorySchema }]),
  ],
  controllers: [BulletinCategoryController],
  providers: [BulletinCategoryService],
  exports: [BulletinCategoryService],
})
export default class BulletinCategoryModule {}
