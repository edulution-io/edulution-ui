import mongoose from 'mongoose';
import { Body, Controller, Delete, Query, Get, Patch, Post, Param, HttpStatus, Logger } from '@nestjs/common';
import { ANSWER_ENDPOINT, RESULT_ENDPOINT, SURVEYS } from '@libs/survey/surveys-endpoint';
import CustomHttpException from '@libs/error/CustomHttpException';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';
import SurveyDto from '@libs/survey/types/survey.dto';
import SurveyStatus from '@libs/survey/types/survey-status-enum';
import GetAnswerDto from '@libs/survey/types/get-answer.dto';
import PushAnswerDto from '@libs/survey/types/push-answer.dto';
import DeleteSurveyDto from '@libs/survey/types/delete-survey.dto';
import { Survey } from './survey.schema';
import SurveysService from './surveys.service';
import SurveyAnswerService from './survey-answer.service';
import GetCurrentUser, { GetCurrentUsername } from '../common/decorators/getUser.decorator';
import JWTUser from '../types/JWTUser';

@Controller(SURVEYS)
class SurveysController {
  constructor(
    private readonly surveyService: SurveysService,
    private readonly surveyAnswerService: SurveyAnswerService,
  ) {}

  @Get()
  async find(@Query('status') status: SurveyStatus, @GetCurrentUsername() username: string) {
    return this.surveyAnswerService.findUserSurveys(status, username);
  }

  @Get(`${RESULT_ENDPOINT}:surveyId`)
  async getSurveyResult(@Param('surveyId') surveyId: mongoose.Types.ObjectId) {
    return this.surveyAnswerService.getPublicAnswers(surveyId);
  }

  @Post(ANSWER_ENDPOINT)
  async getCommittedSurveyAnswers(@Body() getAnswerDto: GetAnswerDto, @GetCurrentUsername() username: string) {
    const { surveyId, attendee } = getAnswerDto;
    return this.surveyAnswerService.getPrivateAnswer(surveyId, attendee || username);
  }

  @Post()
  async updateOrCreateSurvey(@Body() surveyDto: SurveyDto) {
    // first extrude the additional info fields from the remaining survey object
    const { invitedGroups, ...surveyData } = surveyDto;
    const { id, created = new Date() } = surveyData;

    const survey: Survey = {
      ...surveyData,
      _id: id,
      id,
      created,
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
      return createdSurvey;
    }
    return updatedSurvey;
  }

  @Delete()
  async deleteSurvey(@Body() deleteSurveyDto: DeleteSurveyDto) {
    const { surveyIds } = deleteSurveyDto;
    try {
      await this.surveyService.deleteSurveys(surveyIds);
      await this.surveyAnswerService.onSurveyRemoval(surveyIds);
    } catch (e) {
      Logger.log(e);
      throw new CustomHttpException(SurveyErrorMessages.NotAbleToDeleteSurveyError, HttpStatus.NOT_MODIFIED, e);
    }
  }

  @Patch()
  async answerSurvey(@Body() pushAnswerDto: PushAnswerDto, @GetCurrentUser() user: JWTUser) {
    const { surveyId, saveNo, answer } = pushAnswerDto;
    return this.surveyAnswerService.addAnswer(surveyId, saveNo, user, answer);
  }
}

export default SurveysController;
