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
    item.extendedOptions.forEach((appExtension) => {
      if (appExtension.extensions) {
        formSchemaObject[`${item.id}.extendedOptions`] = z
          .array(
            z.object({
              name: z.string(),
              extensions: z.array(
                z.object({
                  name: z.string(),
                  value: z.any(),
                  width: z.string().optional(),
                  type: z.string().optional(),
                  defaultValue: z.any().optional(),
                  choices: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
                }),
              ),
            }),
          )
          .optional();
      }
    });
  }
});

const formSchema = z.object(formSchemaObject);

export default formSchema;
