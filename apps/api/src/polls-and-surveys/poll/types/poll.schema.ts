import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type PollChoice = {
  choice: string;
  userLabel: string;
  userName?: string;
};

export type PollDocument = Poll & Document;

@Schema()
export class Poll {
  @Prop({ required: true })
  pollName: string;

  @Prop({ type: Array<string>, required: true })
  participants: string[];

  @Prop({ type: JSON, required: true })
  poll: JSON;

  @Prop()
  choices: PollChoice[];

  @Prop()
  saveNo: string;

  @Prop()
  created: string;

  @Prop()
  isAnonymous: boolean;

  @Prop()
  isAnswerChangeable: boolean;
}

export const PollSchema = SchemaFactory.createForClass(Poll);

export default PollSchema;
