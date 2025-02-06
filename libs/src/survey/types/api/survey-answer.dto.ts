import AttendeeDto from '@libs/user/types/attendee.dto';

interface SurveyAnswerDto {
  id: string;
  attendee: AttendeeDto;
  surveyId: string;
  saveNo: number;
  answer: JSON;
}

export default SurveyAnswerDto;
