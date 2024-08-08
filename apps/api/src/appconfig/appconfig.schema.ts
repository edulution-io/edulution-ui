import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AppConfigOptions, AppIntegrationType } from '@libs/appconfig/types';
import MultipleSelectorGroup from '@libs/user/types/groups/multipleSelectorGroup';
import { AppConfigExtendedOption } from '@libs/appconfig/types/appExtendedType';

@Schema({ timestamps: true, strict: true })
export class AppConfig extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  icon: string;

  @Prop({ type: Object, default: {} })
  extendedOptions: AppConfigExtendedOption[];

  @Prop({ required: true, type: String })
  appType: AppIntegrationType;

  @Prop({ type: Object, default: {} })
  options: AppConfigOptions;

  @Prop({ type: Object, default: {} })
  accessGroups: MultipleSelectorGroup[];
}

export const AppConfigSchema = SchemaFactory.createForClass(AppConfig);
