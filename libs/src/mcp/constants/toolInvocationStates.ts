const toolInvocationStates = {
  OUTPUT_AVAILABLE: 'output-available',
  OUTPUT_ERROR: 'output-error',
  INPUT_STREAMING: 'input-streaming',
  INPUT_AVAILABLE: 'input-available',
} as const;

export default toolInvocationStates;
