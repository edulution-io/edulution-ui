import useLmnApiStore from '@/store/lmnApiStore';

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
