import { z } from 'zod';
import { APP_CONFIG_OPTIONS } from './appConfigOptions';

const formSchemaObject: { [key: string]: z.Schema } = {};

APP_CONFIG_OPTIONS.forEach((item) => {
  formSchemaObject[`${item.id}.appType`] = z.string().optional();
  if (item.options) {
    item.options.forEach((itemOption) => {
      formSchemaObject[`${item.id}.${itemOption}`] = z.string().optional();
    });
  }
  if (item.extendedOptions) {
    item.extendedOptions.forEach((extension) => {
      formSchemaObject[`${item.id}.${extension.value}`] = z.string().optional();
    });
  }
});

const formSchema = z.object(formSchemaObject);

export default formSchema;
