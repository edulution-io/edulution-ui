import { z } from 'zod';
import { APP_CONFIG_OPTIONS } from './appConfigOptions';

const formSchemaObject: { [key: string]: z.Schema } = {};

APP_CONFIG_OPTIONS.forEach((item) => {
  formSchemaObject[`${item.name}.appType`] = z.string().optional();
  if (item.options) {
    item.options.forEach((appSection) => {
      if (appSection.options) {
        formSchemaObject[`${item.name}.options`] = z
          .array(
            z.object({
              sectionName: z.string(),
              options: z.array(
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
