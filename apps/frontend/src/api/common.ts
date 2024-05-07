export const waitForToken = () =>
  new Promise<void>((resolve) => {
    const checkToken = () => {
      const token = sessionStorage.getItem('lmnApiToken');
      if (token) {
        resolve();
      } else {
        setTimeout(checkToken, 100, 3);
      }
    };
    checkToken();
  });

export default waitForToken;
