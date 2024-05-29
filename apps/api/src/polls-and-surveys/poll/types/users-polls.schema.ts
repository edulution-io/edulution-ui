import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PollChoice = {
  pollName: string;
  choices: {
    userLabel: string;
    choice: string;
  }[];
};

export type UsersPollsDocument = UsersPolls & Document;

@Schema()
export class UsersPolls {
  @Prop()
  openPolls: string[];

  @Prop()
  createdPolls: string[];

  @Prop()
  answeredPolls: string[];
}

export const UsersPollsSchema = SchemaFactory.createForClass(UsersPolls);

export default UsersPollsSchema;
