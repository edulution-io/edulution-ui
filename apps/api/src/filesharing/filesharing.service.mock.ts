import { Readable } from 'stream';

const fileStream = new Readable();
fileStream.push(Buffer.from('file content'));
fileStream.push(null);

const mockFile = {
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
