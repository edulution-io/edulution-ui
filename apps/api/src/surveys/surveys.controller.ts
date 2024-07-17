import mongoose from 'mongoose';
import { Body, Controller, Delete, Get, Patch, Post, Param, HttpStatus, Logger } from '@nestjs/common';
import SurveyDto from '@libs/survey/types/survey.dto';
import GetAnswerDto from '@libs/survey/types/get-answer.dto';
import PushAnswerDto from '@libs/survey/types/push-answer.dto';
import DeleteSurveyDto from '@libs/survey/types/delete-survey.dto';
import FindSurveyDto from '@libs/survey/types/find-survey.dto';
import {
  ANSWER_ENDPOINT,
  ANSWERED_SURVEYS_ENDPOINT,
  CREATED_SURVEYS_ENDPOINT,
  OPEN_SURVEYS_ENDPOINT,
  RESULT_ENDPOINT,
  SURVEYS,
} from '@libs/survey/surveys-endpoint';
import CustomHttpException from '@libs/error/CustomHttpException';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';
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
  async findSurveys(@Body() findSurveyDto: FindSurveyDto) {
    const { surveyId, surveyIds = [] } = findSurveyDto;
    if (surveyIds.length > 0) {
      return this.surveyService.findSurveys(surveyIds);
    }
    if (surveyId) {
      return this.surveyService.findOneSurvey(surveyId);
    }
    throw new CustomHttpException(SurveyErrorMessages.notAbleToFindSurveyParameterError, HttpStatus.BAD_REQUEST);
  }

  @Get(OPEN_SURVEYS_ENDPOINT)
  async getOpenSurveys(@GetCurrentUsername() username: string) {
    return this.surveyAnswerService.getOpenSurveys(username);
  }

  @Get(CREATED_SURVEYS_ENDPOINT)
  async getCreatedSurveys(@GetCurrentUsername() username: string) {
    return this.surveyAnswerService.getCreatedSurveys(username);
  }

  @Get(ANSWERED_SURVEYS_ENDPOINT)
  async getAnsweredSurveys(@GetCurrentUsername() username: string) {
    return this.surveyAnswerService.getAnsweredSurveys(username);
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
