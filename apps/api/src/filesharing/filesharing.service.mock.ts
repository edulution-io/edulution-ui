import { Readable } from 'stream';

interface CustomFile {
  buffer: Buffer;
  originalName?: string;
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  stream: Readable;
}

const fileStream = new Readable();
fileStream.push(Buffer.from('file content'));
fileStream.push(null);

const mockFile: CustomFile = {
  buffer: Buffer.from('test content'),
  stream: fileStream,
  fieldname: 'uploadedFile',
  originalname: 'testfile.txt',
  encoding: '7bit',
  mimetype: 'text/plain',
  size: 1234,
  destination: 'uploads/',
  filename: 'testfile.txt',
  path: 'uploads/testfile.txt',
};

export default mockFile;
