import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';

export type BulletinCategoryDocument = BulletinCategory & Document;

@Schema()
export class BulletinCategory {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Array, default: [] })
  visibleByUsers: MultipleSelectorGroup[];

  @Prop({ type: Array, default: [] })
  editableByUsers: MultipleSelectorGroup[];
}

export const BulletinCategorySchema = SchemaFactory.createForClass(BulletinCategory);

export default BulletinCategorySchema;
