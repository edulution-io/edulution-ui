import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class UserDto {
  @ApiPropertyOptional({ description: 'ID of the user', example: '123456' })
  _id?: string;

  @ApiProperty({ description: 'Username for the user', example: 'john_doe' })
  username: string;

  @ApiPropertyOptional({ description: 'First name of the user', example: 'John' })
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name of the user', example: 'Doe' })
  lastName?: string;

  @ApiProperty({ description: 'Email address of the user', example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({
    description: 'LDAP groups the user belongs to',
    example: {
      schools: ['school1', 'school2'],
      projects: ['project1', 'project2'],
      projectPaths: ['/path/to/project1', '/path/to/project2'],
      classes: ['class1', 'class2'],
      classPaths: ['/path/to/class1', '/path/to/class2'],
      roles: ['role1', 'role2'],
      others: ['other1', 'other2'],
    },
    type: 'object',
  })
  ldapGroups: {
    schools: string[];
    projects: string[];
    projectPaths: string[];
    classes: string[];
    classPaths: string[];
    roles: string[];
    others: string[];
  };

  @ApiProperty({ description: 'Password for the user', example: 'securePassword123' })
  password: string;

  @ApiPropertyOptional({ description: 'Is MFA enabled?', example: false })
  mfaEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Is TOTP set up?', example: false })
  isTotpSet?: boolean;
}

export default UserDto;
