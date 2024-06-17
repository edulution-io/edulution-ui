class RegisterUserDto {
  preferred_username: string;

  email: string;

  ldapGroups: string[];
}

export default RegisterUserDto;
