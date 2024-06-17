export default interface User {
  _id: string;
  username: string;
  email: string;
  roles: string[];
  mfaEnabled: boolean;
  isTotpSet: boolean;
}
