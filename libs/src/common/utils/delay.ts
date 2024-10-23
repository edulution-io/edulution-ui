// eslint-disable-next-line no-promise-executor-return
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default delay;
