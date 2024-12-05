import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Bulletin, BulletinSchema } from './bulletin.schema';
import BulletinBoardController from './bulletinboard.controller';
import BulletinBoardService from './bulletinboard.service';
import { BulletinCategory, BulletinCategorySchema } from '../bulletin-category/bulletin-category.schema';
import BulletinCategoryModule from '../bulletin-category/bulletin-category.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Bulletin.name, schema: BulletinSchema }]),
    MongooseModule.forFeature([{ name: BulletinCategory.name, schema: BulletinCategorySchema }]),
    BulletinCategoryModule,
  ],
  controllers: [BulletinBoardController],
  providers: [BulletinBoardService],
  exports: [BulletinBoardService],
})
export default class BulletinBoardModule {}
