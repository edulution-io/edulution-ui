// This type is based on a third-party object definition, see static/cookie-test.html
// Any modifications should be carefully reviewed to ensure compatibility with the source.
interface CookieInfo {
  description: string;
  wasSet: boolean;
}

interface ExtendedCookieTestResult {
  cookieTest: 'complete';
  rawCookies: string;
  results: Record<string, CookieInfo>;
}
export default ExtendedCookieTestResult;
