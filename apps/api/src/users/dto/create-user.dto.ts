class CreateUserDto {
  username: string;

  email: string;

  password?: string;

  roles: string[];

  mfaEnabled?: boolean;

  isTotpSet?: boolean;
}

export default CreateUserDto;
