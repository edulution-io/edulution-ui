import mongoose from 'mongoose';
import { AppIntegrationType } from './types/appconfig.types';

const AppConfigSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    linkPath: { type: String, required: false },
    icon: { type: String, required: true },
    appType: { type: String, enum: Object.values(AppIntegrationType), required: true },
  },
  { strict: true },
);

AppConfigSchema.set('timestamps', true);

export default AppConfigSchema;
