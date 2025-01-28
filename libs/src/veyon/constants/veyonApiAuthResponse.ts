// This type is based on a third-party object definition from veyon web-API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.

const VEYON_API_AUTH_RESPONSE_KEYS = {
  CONNECTION_UID: 'connection-uid',
  VALID_UNTIL: 'validUntil',
} as const;

export default VEYON_API_AUTH_RESPONSE_KEYS;
