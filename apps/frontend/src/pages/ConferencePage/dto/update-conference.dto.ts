import { PartialType } from '@nestjs/mapped-types';
import CreateConferenceDto from './create-conference.dto';

class UpdateConferenceDto extends PartialType(CreateConferenceDto) {}

export default UpdateConferenceDto;
