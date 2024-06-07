import { PartialType } from '@nestjs/mapped-types';
import CreateUsersSurveysDto from './create-users-surveys.dto';

class UpdateUsersSurveysDto extends PartialType(CreateUsersSurveysDto) {}

export default UpdateUsersSurveysDto;
