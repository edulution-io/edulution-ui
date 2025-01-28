import ExtendedCookieTestResult from '@libs/common/types/cookieTestResult';
import COOKIE_TEST_URL from '@libs/common/constants/cookieTestUrl';

const testCookieAccess = async (): Promise<ExtendedCookieTestResult | null> => {
  try {
    const response = await fetch(COOKIE_TEST_URL, { method: 'HEAD' });
    if (!response.ok) {
      return null;
    }
  } catch (_) {
    return null;
  }

  return new Promise((resolve) => {
    let resolved = false;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = COOKIE_TEST_URL;

    const cleanupAndResolve = (value: ExtendedCookieTestResult | null) => {
      if (!resolved) {
        resolved = true;
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        window.removeEventListener('message', handleMessage);
        if (iframe.parentNode) {
          document.body.removeChild(iframe);
        }
        resolve(value);
      }
    };

    const handleMessage = (event: MessageEvent<ExtendedCookieTestResult>) => {
      const testUrlOrigin = new URL(COOKIE_TEST_URL).origin;
      if (event.origin !== testUrlOrigin) return;

      if (event.data.cookieTest === 'complete') {
        cleanupAndResolve(event.data);
      }
    };

    window.addEventListener('message', handleMessage);
    document.body.appendChild(iframe);

    iframe.onerror = () => {
      cleanupAndResolve(null);
    };
  });
};

export default testCookieAccess;
