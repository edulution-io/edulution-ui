import { Model } from 'mongoose';

export type Migration<T> = {
  name: string;
  version: number;
  execute: (model: Model<T>) => Promise<void>;
};
