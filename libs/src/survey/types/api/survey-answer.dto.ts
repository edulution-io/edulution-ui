import mongoose from 'mongoose';
import AttendeeDto from '@libs/conferences/types/attendee.dto';

interface SurveyAnswerDto {
  id: mongoose.Types.ObjectId;
  attendee: AttendeeDto;
  surveyId: mongoose.Types.ObjectId;
  saveNo: number;
  answer: JSON;
}

export default SurveyAnswerDto;
