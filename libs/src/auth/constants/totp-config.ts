const AUTH_TOTP_CONFIG = {
  issuer: 'edulution-ui',
  algorithm: 'SHA1',
  digits: 6,
  period: 30,
} as const;

export default AUTH_TOTP_CONFIG;
