import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import Attendee from '../conferences/attendee.schema';

export type BulletinCategoryDocument = BulletinCategory & Document;

@Schema({ timestamps: true })
export class BulletinCategory {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Array, default: [] })
  visibleForUsers: MultipleSelectorGroup[];

  @Prop({ type: Array, default: [] })
  visibleForGroups: MultipleSelectorGroup[];

  @Prop({ type: Array, default: [] })
  editableByUsers: MultipleSelectorGroup[];

  @Prop({ type: Array, default: [] })
  editableByGroups: MultipleSelectorGroup[];

  @Prop({ type: Object, required: true })
  creator: Attendee;
}

export const BulletinCategorySchema = SchemaFactory.createForClass(BulletinCategory);

BulletinCategorySchema.set('toJSON', {
  virtuals: true,
});
