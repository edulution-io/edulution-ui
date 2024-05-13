import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  username: string;

  @Prop()
  email: string;

  @Prop()
  password: string;

  @Prop({ required: true })
  roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);

export default UserSchema;
