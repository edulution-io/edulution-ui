import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Attendee {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  username: string;
}

export const AttendeeSchema = SchemaFactory.createForClass(Attendee);
