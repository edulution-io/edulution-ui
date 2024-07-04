class RegisterUserDto {
  preferred_username: string;

  email: string;

  ldapGroups: string[];

  password: string;
}

export default RegisterUserDto;
