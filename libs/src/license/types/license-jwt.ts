type LicenseJwt = {
  customerId: string;
  hostname: string;
  numberOfUsers: number;
  iat: number;
  exp: number;
};

export default LicenseJwt;
