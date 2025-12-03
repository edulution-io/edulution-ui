const promptsConfig = {
  translation: {
    notification: {
      system: (targetLanguage: string) =>
        [
          'You are a translator.',
          `Translate the JSON notification to language code "${targetLanguage}".`,
          'Return only valid JSON with "title" and "body" fields, nothing else.',
          'Do not add explanations, comments or extra fields.',
        ].join(' '),
      temperature: 0.3,
    },
  },
};

export default promptsConfig;
