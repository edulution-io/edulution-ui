import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AppConfigOptions } from '@libs/appconfig/types';
import AppIntegrationType from '@libs/appconfig/types/appIntegrationType';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { AppConfigExtendedOption } from '@libs/appconfig/constants/appExtendedType';

@Schema({ timestamps: true, strict: true })
export class AppConfig extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  icon: string;

  @Prop({ type: Array, default: [] })
  extendedOptions: AppConfigExtendedOption[];

  @Prop({ required: true, type: String })
  appType: AppIntegrationType;

  @Prop({ type: Object, default: {} })
  options: AppConfigOptions;

  @Prop({ type: Array, default: [] })
  accessGroups: MultipleSelectorGroup[];
}

export const AppConfigSchema = SchemaFactory.createForClass(AppConfig);
