import { z } from 'zod';

const formSchemaObject: { [key: string]: z.Schema } = {};

const formSchema = z.object(formSchemaObject);

export default formSchema;
