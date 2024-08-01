import { Readable } from 'stream';

interface CustomFile {
  buffer: Buffer;
  stream: Readable;
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

export default CustomFile;
