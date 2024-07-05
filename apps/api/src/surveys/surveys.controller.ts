import mongoose from 'mongoose';
import { Body, Controller, Delete, Get, Patch, Post, Param, HttpStatus } from '@nestjs/common';
import SurveyDto from '@libs/survey/types/survey.dto';
import GetAnswerDto from '@libs/survey/types/get-answer.dto';
import PushAnswerDto from '@libs/survey/types/push-answer.dto';
import DeleteSurveyDto from '@libs/survey/types/delete-survey.dto';
import FindSurveyDto from '@libs/survey/types/find-survey.dto';
import {
  ANSWER_ENDPOINT,
  ANSWERED_SURVEYS_ENDPOINT,
  CREATED_SURVEYS_ENDPOINT,
  ALL_SURVEYS_ENDPOINT,
  OPEN_SURVEYS_ENDPOINT,
  RESULT_ENDPOINT,
  SURVEYS,
} from '@libs/survey/surveys-endpoint';
import CustomHttpException from '@libs/error/CustomHttpException';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';
import { Survey } from './survey.schema';
import SurveysService from './surveys.service';
import SurveyAnswerService from './survey-answer.service';
import UsersSurveysService from './users-surveys.service';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';

@Controller(SURVEYS)
class SurveysController {
  constructor(
    private readonly surveyService: SurveysService,
    private readonly surveyAnswerService: SurveyAnswerService,
    private readonly usersSurveysService: UsersSurveysService,
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
    return this.surveyService.findSurveys(await this.usersSurveysService.getOpenSurveyIds(username));
  }

  @Get(CREATED_SURVEYS_ENDPOINT)
  async getCreatedSurveys(@GetCurrentUsername() username: string) {
    return this.surveyService.findSurveys(await this.usersSurveysService.getCreatedSurveyIds(username));
  }

  @Get(ANSWERED_SURVEYS_ENDPOINT)
  async getAnsweredSurveys(@GetCurrentUsername() username: string) {
    return this.surveyService.findSurveys(await this.usersSurveysService.getAnsweredSurveyIds(username));
  }

  @Get(ALL_SURVEYS_ENDPOINT)
  async getAllSurveys() {
    return this.surveyService.getAllSurveys();
  }

  @Get(`${RESULT_ENDPOINT}:surveyId`)
  async getSurveyResult(@Param('surveyId') surveyId: mongoose.Types.ObjectId) {
    return this.surveyAnswerService.getPublicAnswers(surveyId);
  }

  @Post(ANSWER_ENDPOINT)
  async getCommittedSurveyAnswers(@Body() getAnswerDto: GetAnswerDto, @GetCurrentUsername() username: string) {
    const { surveyId, participant = username } = getAnswerDto;
    return this.surveyAnswerService.getPrivateAnswer(surveyId, participant);
  }

  @Post()
  async updateOrCreateSurvey(@Body() surveyDto: SurveyDto, @GetCurrentUsername() username: string) {
    // first extrude the additional info fields from the remaining survey object
    const { invitedAttendees, ...surveyData } = surveyDto;
    const { id, saveNo = 0, created = new Date(), isAnonymous, canSubmitMultipleAnswers } = surveyData;

    const survey: Survey = {
      ...surveyData,
      // eslint-ignore-next-line @typescript/no-underscore-dangle
      _id: id,
      id,
      saveNo,
      created,
      isAnonymous,
      canSubmitMultipleAnswers,
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
      await this.usersSurveysService.addToCreatedSurveys(username, id);
      await this.usersSurveysService.populateSurvey(invitedAttendees, id);
      return createdSurvey;
    }

    return updatedSurvey;
  }

  @Delete()
  async deleteSurvey(@Body() deleteSurveyDto: DeleteSurveyDto) {
    const { surveyIds } = deleteSurveyDto;
    try {
      await this.surveyService.deleteSurveys(surveyIds);
      await this.surveyAnswerService.onRemoveSurveys(surveyIds);
      await this.usersSurveysService.onRemoveSurveys(surveyIds);
    } catch (e) {
      throw new CustomHttpException(SurveyErrorMessages.NotAbleToDeleteSurveyError, HttpStatus.NOT_MODIFIED, e);
    }
  }

  @Patch()
  async answerSurvey(@Body() pushAnswerDto: PushAnswerDto, @GetCurrentUsername() username: string) {
    const { surveyId, answer } = pushAnswerDto;
    return this.surveyAnswerService.addAnswer(surveyId, answer, username);
  }
}

export default SurveysController;
