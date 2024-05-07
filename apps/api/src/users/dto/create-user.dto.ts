class CreateUserDto {
  username: string;

  email: string;

  password?: string;

  roles: string[];
}

export default CreateUserDto;
