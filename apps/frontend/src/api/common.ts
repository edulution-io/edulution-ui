type UserDataConfig = { state: { lmnApiToken: string } };

const waitForToken = () =>
  new Promise<void>((resolve) => {
    const checkToken = () => {
      const lmnUserStorageString = localStorage.getItem('lmn-user-storage') as string;
      const lmnUserStorage = JSON.parse(lmnUserStorageString) as UserDataConfig;
      const { lmnApiToken } = lmnUserStorage.state;
      if (lmnApiToken) {
        resolve();
      } else {
        setTimeout(checkToken, 100, 3);
      }
    };
    checkToken();
  });

export default waitForToken;
