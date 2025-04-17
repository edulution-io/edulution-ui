import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'tldrawSyncRooms' })
export class TldrawSyncRoom {
  @Prop({ required: true, unique: true })
  roomId: string;

  @Prop({ type: Object, required: true })
  roomData: any;
}

export type TldrawSyncRoomDocument = TldrawSyncRoom & Document;
export const TldrawSyncRoomSchema = SchemaFactory.createForClass(TldrawSyncRoom);
