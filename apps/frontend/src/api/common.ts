import useLmnApiStore from '@/store/useLmnApiStore';

const waitForToken = () =>
  new Promise<void>((resolve) => {
    const checkToken = () => {
      const { lmnApiToken } = useLmnApiStore();
      if (lmnApiToken) {
        resolve();
      } else {
        setTimeout(checkToken, 100, 3);
      }
    };
    checkToken();
  });

export default waitForToken;
