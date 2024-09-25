const AUTH_PATHS = {
  AUTH_ENDPOINT: 'auth',
  AUTH_OIDC_CONFIG_PATH: '/.well-known/openid-configuration',
  AUTH_OIDC_TOKEN_PATH: '/protocol/openid-connect/token',
  AUTH_OIDC_USERINFO_PATH: '/protocol/openid-connect/userinfo',
  AUTH_QRCODE: 'qrcode',
} as const;

export default AUTH_PATHS;
