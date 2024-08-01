import { pipeline, Readable } from 'stream';
import { AxiosResponse } from 'axios';
import { promisify } from 'util';
import { createWriteStream } from 'fs';

const saveFileStream = async (fileStream: Readable | AxiosResponse<Readable>, outputPath: string): Promise<void> => {
  const pipelineAsync = promisify(pipeline);
  const readableStream = (fileStream as AxiosResponse<Readable>).data
    ? (fileStream as AxiosResponse<Readable>).data
    : (fileStream as Readable);
  await pipelineAsync(readableStream, createWriteStream(outputPath));
};
export default saveFileStream;
