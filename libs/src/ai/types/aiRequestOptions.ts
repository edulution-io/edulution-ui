interface AiRequestOptions {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  configId?: string;
  purpose?: string;
}

export default AiRequestOptions;
