import { Model } from 'mongoose';
import { AppConfig } from '../appconfig/appconfig.schema';

export type MigrationModels = AppConfig;

export type Migration<T> = {
  name: string;
  version: number;
  execute: (model: Model<T>) => Promise<void>;
};
