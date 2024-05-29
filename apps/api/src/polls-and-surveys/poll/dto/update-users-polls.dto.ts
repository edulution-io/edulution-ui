import { PartialType } from '@nestjs/mapped-types';
import CreateUsersPollsDto from './create-users-polls.dto';

class UpdateUsersPollsDto extends PartialType(CreateUsersPollsDto) {}

export default UpdateUsersPollsDto;
