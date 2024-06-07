import { PartialType } from '@nestjs/mapped-types';
import CreateSurveyDto from './create-survey.dto';

class UpdateSurveyDto extends PartialType(CreateSurveyDto) {}

export default UpdateSurveyDto;
