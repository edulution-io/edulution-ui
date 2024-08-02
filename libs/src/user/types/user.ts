export default interface User {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  roles: string[];
  mfaEnabled: boolean;
  isTotpSet: boolean;
}
