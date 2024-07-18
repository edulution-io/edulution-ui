import mongoose from 'mongoose';
import { Body, Controller, Delete, Get, Patch, Post, Param, HttpException, HttpStatus } from '@nestjs/common';
import SurveyDto from '@libs/survey/types/survey.dto';
import PushAnswerDto from '@libs/survey/types/push-answer.dto';
import DeleteSurveyDto from '@libs/survey/types/delete-survey.dto';
import FindSurveyDto from '@libs/survey/types/find-survey.dto';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';
import { RESULT_ENDPOINT, SURVEYS } from '@libs/survey/surveys-endpoint';
import CustomHttpException from '@libs/error/CustomHttpException';
import { Survey } from './survey.schema';
import SurveysService from './surveys.service';
import SurveyAnswerService from './survey-answer.service';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';

@Controller(SURVEYS)
class SurveysController {
  constructor(
    private readonly surveyService: SurveysService,
    private readonly surveyAnswerService: SurveyAnswerService,
  ) {}

  @Get()
  async findSurveys(@Body() findSurveyDto: FindSurveyDto) {
    const { surveyIds = [] } = findSurveyDto;
    if (surveyIds.length > 0) {
      return this.surveyService.findSurveys(surveyIds);
    }
    throw new HttpException(SurveyErrorMessages.notAbleToFindSurveyParameterError, HttpStatus.BAD_REQUEST);
  }

  @Get(`${RESULT_ENDPOINT}:surveyId`)
  async getSurveyResult(@Param('surveyId') surveyId: mongoose.Types.ObjectId) {
    return this.surveyAnswerService.getPublicAnswers(surveyId);
  }

  @Post()
  async updateOrCreateSurvey(@Body() surveyDto: SurveyDto) {
    // first extrude the additional info fields from the remaining survey object
    const { invitedAttendees, ...surveyData } = surveyDto;
    const { id, saveNo = 0, created = new Date(), isAnonymous, canSubmitMultipleAnswers } = surveyData;

    const survey: Survey = {
      ...surveyData,
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
  async answerSurvey(@Body() pushAnswerDto: PushAnswerDto, @GetCurrentUsername() username: string) {
    const { surveyId, answer } = pushAnswerDto;
    return this.surveyAnswerService.addAnswer(surveyId, answer, username);
  }
}

export default SurveysController;
