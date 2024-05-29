import { PartialType } from '@nestjs/mapped-types';
import CreatePollDto from './create-poll.dto';

class UpdatePollDto extends PartialType(CreatePollDto) {}

export default UpdatePollDto;
