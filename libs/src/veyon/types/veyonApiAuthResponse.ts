// This type is based on a third-party object definition from veyon web-API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.

type VeyonApiAuthResponse = {
  ['connection-uid']: string;
  validUntil: number;
};

export default VeyonApiAuthResponse;
