export default async function executeNowAndRepeatedly(action: () => Promise<void>, timeout: number): Promise<void> {
  await action();

  setInterval(() => {
    action();
  }, timeout);
}
