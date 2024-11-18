import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AppConfigSection, AppIntegrationType } from '@libs/appconfig/types';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';

@Schema({ timestamps: true, strict: true })
export class AppConfig extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  icon: string;

  @Prop({ required: true, type: String })
  appType: AppIntegrationType;

  @Prop({ type: Array, default: [] })
  options: AppConfigSection[];

  @Prop({ type: Array, default: [] })
  accessGroups: MultipleSelectorGroup[];
}

export const AppConfigSchema = SchemaFactory.createForClass(AppConfig);
