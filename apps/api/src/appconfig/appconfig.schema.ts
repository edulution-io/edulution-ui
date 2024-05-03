import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AppIntegrationType } from './appconfig.types';

@Schema({ timestamps: true, strict: true })
class AppConfig extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  linkPath: string;

  @Prop({ required: true })
  icon: string;

  @Prop({ required: true, enum: Object.values(AppIntegrationType) })
  appType: string;
}

const AppConfigSchema = SchemaFactory.createForClass(AppConfig);

export default AppConfigSchema;
