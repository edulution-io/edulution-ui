import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import QueueService from './queue.service';
import DuplicateFileConsumer from '../filesharing/consumers/duplicateFile.consumer';
import CollectFileConsumer from '../filesharing/consumers/collectFile.consumer';
import DeleteFileConsumer from '../filesharing/consumers/deleteFile.consumer';
import MoveOrRenameConsumer from '../filesharing/consumers/moveOrRename.consumer';
import CopyFileConsumer from '../filesharing/consumers/copyFile.consumer';
import CreateFolderConsumer from '../filesharing/consumers/createFolder.consumer';
import { PublicFileShareSchema, PublicShare } from '../filesharing/publicFileShare.schema';

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: PublicShare.name, schema: PublicFileShareSchema }])],
  providers: [
    QueueService,
    DuplicateFileConsumer,
    CollectFileConsumer,
    DeleteFileConsumer,
    MoveOrRenameConsumer,
    CopyFileConsumer,
    CreateFolderConsumer,
  ],
  exports: [QueueService],
})
export default class QueueModule {}
