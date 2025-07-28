type AnsweredFile = {
  name: string;
  path: string;
  content: string | Buffer<ArrayBufferLike>;
};

export default AnsweredFile;