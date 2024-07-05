class CreateUserDto {
  username: string;

  email: string;

  password?: string;

  ldapGroups: string[];
}

export default CreateUserDto;
