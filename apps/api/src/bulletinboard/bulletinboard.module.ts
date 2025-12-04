/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
