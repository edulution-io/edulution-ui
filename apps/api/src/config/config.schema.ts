import mongoose from 'mongoose';
import { AppType } from './types/appconfig.types';

const ConfigSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    linkPath: { type: String, required: false },
    icon: { type: String, required: true },
    appType: { type: String, enum: Object.values(AppType), required: true },
  },
  { strict: true },
);

ConfigSchema.set('timestamps', true);

export default ConfigSchema;
