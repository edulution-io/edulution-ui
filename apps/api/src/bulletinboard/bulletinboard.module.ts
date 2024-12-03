import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Bulletin, BulletinSchema } from './bulletin.schema';
import BulletinBoardController from './bulletinboard.controller';
import BulletinBoardService from './bulletinboard.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Bulletin.name, schema: BulletinSchema }])],
  controllers: [BulletinBoardController],
  providers: [BulletinBoardService],
  exports: [BulletinBoardService],
})
export default class BulletinBoardModule {}
