import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AppConfigOptions, AppIntegrationType } from './appconfig.types';

@Schema({ timestamps: true, strict: true })
export class AppConfig extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  icon: string;

  @Prop({ required: true, enum: Object.values(AppIntegrationType) })
  appType: string;

  @Prop({ type: Object, default: {} })
  options: AppConfigOptions;
}

const AppConfigSchema = SchemaFactory.createForClass(AppConfig);

export default AppConfigSchema;
