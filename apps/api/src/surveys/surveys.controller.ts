import mongoose from 'mongoose';
import {Body, Controller, Delete, Get, Post, Patch, Param} from '@nestjs/common';
import UpdateOrCreateSurveyDto from '@libs/survey/dto/update-or-create-survey.dto';
import PushAnswerDto from '@libs/survey/dto/push-answer.dto';
import DeleteSurveyDto from '@libs/survey/dto/delete-survey.dto';
import {
  All_SURVEYS_ENDPOINT,
  FIND_ONE_ENDPOINT,
  FIND_SURVEYS_ENDPOINT,
  RESULT_ENDPOINT,
  SURVEYS
} from '@libs/survey/surveys-endpoint';
import { SurveyModel } from './types/survey.schema';
import SurveysService from './surveys.service';

@Controller(SURVEYS)
class SurveysController {
  constructor(private readonly surveyService: SurveysService) {}

  @Post()
  async updateOrCreateSurvey(@Body() updateOrCreateSurveyDto: UpdateOrCreateSurveyDto) {
    const {
      publicAnswers = [],
      saveNo = 0,
      created = new Date(),
      isAnonymous,
      canSubmitMultipleAnswers,
    } = updateOrCreateSurveyDto;

    const survey: SurveyModel = {
      ...updateOrCreateSurveyDto,
      publicAnswers,
      saveNo,
      created,
      isAnonymous: !!isAnonymous,
      canSubmitMultipleAnswers: !!canSubmitMultipleAnswers,
    };

    const newSurvey = await this.surveyService.updateOrCreateSurvey(survey);
    return newSurvey;
  }

  @Get(`${FIND_ONE_ENDPOINT}:surveyId`)
  async findOneSurvey(@Param('surveyId') surveyId: mongoose.Types.ObjectId) {
    return this.surveyService.findOneSurvey(surveyId);
  }

  @Get(`${FIND_SURVEYS_ENDPOINT}:surveyIds`)
  async findSurveys(@Param('surveyIds') surveyIds: mongoose.Types.ObjectId[]) {
    return this.surveyService.findSurveys(surveyIds);
  }

  @Get(All_SURVEYS_ENDPOINT)
  async getAllSurveys() {
    return this.surveyService.getAllSurveys();
  }

  @Get(`${RESULT_ENDPOINT}:surveyId`)
  async getSurveyResult(@Param('surveyId') surveyId: mongoose.Types.ObjectId) {
    return this.surveyService.getPublicAnswers(surveyId);
  }

  @Delete()
  deleteSurvey(@Body() deleteSurveyDto: DeleteSurveyDto) {
    return this.surveyService.deleteSurveys(deleteSurveyDto.surveyIds);
  }

  @Patch()
  async answerSurvey(@Body() pushAnswerDto: PushAnswerDto) {
    const { surveyId, answer } = pushAnswerDto;
    const updatedSurvey = await this.surveyService.addPublicAnswer(surveyId, answer);
    return updatedSurvey;
  }
}

export default SurveysController;
