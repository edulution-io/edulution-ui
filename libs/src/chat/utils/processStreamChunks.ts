const processStreamChunks = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder,
  onChunk: (fullText: string) => void,
  currentText = '',
): Promise<string> => {
  const { done, value } = await reader.read();

  if (done) {
    return currentText;
  }

  const chunk = decoder.decode(value, { stream: true });
  const newText = currentText + chunk;
  onChunk(newText);

  return processStreamChunks(reader, decoder, onChunk, newText);
};

export default processStreamChunks;
