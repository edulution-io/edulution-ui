class LoginUserDto {
  preferred_username: string;

  password: string;

  email: string;

  ldapGroups: string[];

  mfaEnabled: boolean;

  isTotpSet: boolean;
}

export default LoginUserDto;
