import mongoose from 'mongoose';
import AttendeeDto from '@libs/conferences/types/attendee.dto';

type SurveyAnswerDto = {
  _id: mongoose.Types.ObjectId;
  id: mongoose.Types.ObjectId;
  attendee: AttendeeDto;
  surveyId: mongoose.Types.ObjectId;
  saveNo: number;
  answer: JSON;
};

export default SurveyAnswerDto;
