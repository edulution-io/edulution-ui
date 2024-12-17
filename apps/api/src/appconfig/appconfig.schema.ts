import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AppConfigOptions } from '@libs/appconfig/types';
import AppIntegrationType from '@libs/appconfig/types/appIntegrationType';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import ExtendedOptionKeysDto from '@libs/appconfig/types/extendedOptionKeysDto';

@Schema({ timestamps: true, strict: true })
export class AppConfig extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  icon: string;

  @Prop({ type: Object, default: {} })
  extendedOptions: ExtendedOptionKeysDto;

  @Prop({ required: true, type: String })
  appType: AppIntegrationType;

  @Prop({ type: Object, default: {} })
  options: AppConfigOptions;

  @Prop({ type: Array, default: [] })
  accessGroups: MultipleSelectorGroup[];

  @Prop({ default: 2 })
  schemaVersion: number;
}

export const AppConfigSchema = SchemaFactory.createForClass(AppConfig);
