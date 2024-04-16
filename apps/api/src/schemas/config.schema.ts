import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ConfigDocument = HydratedDocument<Config>;

@Schema()
export class Config {
  @Prop({ type: Object, required: true })
  configs: { [key: string]: { linkPath: string; icon: string; appType: string } };
}

export const CatSchema = SchemaFactory.createForClass(Config);
