import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import BulletinCategoryController from './bulletin-category.controller';
import BulletinCategoryService from './bulletin-category.service';
import { BulletinCategory, BulletinCategorySchema } from './bulletin-category.schema';
import { Bulletin, BulletinSchema } from '../bulletinboard/bulletin.schema';
import MigrationService from '../migration/migration.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bulletin.name, schema: BulletinSchema }]),
    MongooseModule.forFeature([{ name: BulletinCategory.name, schema: BulletinCategorySchema }]),
  ],
  controllers: [BulletinCategoryController],
  providers: [BulletinCategoryService, MigrationService],
  exports: [BulletinCategoryService],
})
export default class BulletinCategoryModule {}
