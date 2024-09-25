import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AppConfigOptions, AppIntegrationType } from '@libs/appconfig/types';
import AppConfigExtendedOptions from '@libs/appconfig/types/appConfigExtendedOptions';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';

@Schema({ timestamps: true, strict: true })
export class AppConfig extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  icon: string;

  @Prop({ type: Array, default: [] })
  extendedOptions: AppConfigExtendedOptions[];

  @Prop({ required: true, type: String })
  appType: AppIntegrationType;

  @Prop({ type: Object, default: {} })
  options: AppConfigOptions;

  @Prop({ type: Array, default: [] })
  accessGroups: MultipleSelectorGroup[];
}

export const AppConfigSchema = SchemaFactory.createForClass(AppConfig);
