const aiApiConfigs = {
  openai: (url: string, apiKey: string, model: string) => ({
    endpoint: `${url}/v1/chat/completions`,
    headers: { Authorization: `Bearer ${apiKey}` },
    body: { model, messages: [{ role: 'user', content: 'Hi' }], max_tokens: 5 },
  }),
  anthropic: (url: string, apiKey: string, model: string) => ({
    endpoint: `${url}/v1/messages`,
    headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: { model, messages: [{ role: 'user', content: 'Hi' }], max_tokens: 5 },
  }),
  google: (url: string, apiKey: string, model: string) => ({
    endpoint: `${url}/v1/models/${model}:generateContent?key=${apiKey}`,
    headers: {},
    body: { contents: [{ parts: [{ text: 'Hi' }] }], generationConfig: { maxOutputTokens: 5 } },
  }),
};

export default aiApiConfigs;
