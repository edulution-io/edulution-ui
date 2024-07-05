import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
class Attendee {
  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop({ required: true })
  username: string;
}

export default Attendee;
