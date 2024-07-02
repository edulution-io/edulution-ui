import mongoose from 'mongoose';
import { Body, Controller, Delete, Get, Patch, Post, Param, HttpException, HttpStatus } from '@nestjs/common';
import UpdateOrCreateSurveyDto from '@libs/survey/types/update-or-create-survey.dto';
import PushAnswerDto from '@libs/survey/types/push-answer.dto';
import DeleteSurveyDto from '@libs/survey/types/delete-survey.dto';
import FindSurveyDto from '@libs/survey/types/find-survey.dto';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';
import { ALL_SURVEYS_ENDPOINT, RESULT_ENDPOINT, SURVEYS } from '@libs/survey/surveys-endpoint';
import CustomHttpException from '@libs/error/CustomHttpException';
import { SurveyModel } from './survey.schema';
import SurveysService from './surveys.service';

@Controller(SURVEYS)
class SurveysController {
  constructor(private readonly surveyService: SurveysService) {}

  @Get()
  async findSurveys(@Body() findSurveyDto: FindSurveyDto) {
    const { surveyId, surveyIds = [] } = findSurveyDto;
    if (surveyIds.length > 0) {
      return this.surveyService.findSurveys(surveyIds);
    }
    if (surveyId) {
      return this.surveyService.findOneSurvey(surveyId);
    }
    throw new HttpException(SurveyErrorMessages.notAbleToFindSurveyParameterError, HttpStatus.BAD_REQUEST);
  }

  @Get(ALL_SURVEYS_ENDPOINT)
  async getAllSurveys() {
    return this.surveyService.getAllSurveys();
  }

  @Get(`${RESULT_ENDPOINT}:surveyId`)
  async getSurveyResult(@Param('surveyId') surveyId: mongoose.Types.ObjectId) {
    return this.surveyService.getPublicAnswers(surveyId);
  }

  @Post()
  async updateOrCreateSurvey(@Body() updateOrCreateSurveyDto: UpdateOrCreateSurveyDto) {
    const {
      id,
      publicAnswers = [],
      saveNo = 0,
      created = new Date(),
      isAnonymous,
      canSubmitMultipleAnswers,
    } = updateOrCreateSurveyDto;

    const survey: SurveyModel = {
      ...updateOrCreateSurveyDto,
      _id: id,
      publicAnswers,
      saveNo,
      created,
      isAnonymous: !!isAnonymous,
      canSubmitMultipleAnswers: !!canSubmitMultipleAnswers,
    };

    const updatedSurvey = await this.surveyService.updateSurvey(survey);
    if (updatedSurvey == null) {
      const createdSurvey = await this.surveyService.createSurvey(survey);
      if (createdSurvey == null) {
        throw new CustomHttpException(
          SurveyErrorMessages.NeitherAbleToUpdateNorToCreateSurveyError,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // TODO: NIEDUUI-254: add user functionality to manage surveys

      return createdSurvey;
    }
    return updatedSurvey;
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
