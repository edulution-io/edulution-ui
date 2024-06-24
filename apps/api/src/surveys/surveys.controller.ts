import mongoose from 'mongoose';
import { Body, Controller, Delete, Get, Patch, Post, Param } from '@nestjs/common';
import UpdateOrCreateSurveyDto from '@libs/survey/dto/update-or-create-survey.dto';
import PushAnswerDto from '@libs/survey/dto/push-answer.dto';
import DeleteSurveyDto from '@libs/survey/dto/delete-survey.dto';
import FindSurveyDto from '@libs/survey/dto/find-survey.dto';
import {
  All_SURVEYS_ENDPOINT,
  FIND_ONE_ENDPOINT,
  FIND_SURVEYS_ENDPOINT,
  RESULT_ENDPOINT,
  SURVEYS,
} from '@libs/survey/surveys-endpoint';
import SurveysService from './surveys.service';
import UsersSurveysService from './users-surveys.service';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';
import { SurveyModel } from './types/survey.schema';

@Controller(SURVEYS)
class SurveysController {
  constructor(
    private readonly surveyService: SurveysService,
    private readonly usersSurveysService: UsersSurveysService,
  ) {}

  @Get(`${FIND_SURVEYS_ENDPOINT}:surveyIds`)
  async findSurveys(@Param('surveyIds') surveyIds: mongoose.Types.ObjectId[]) {
    return this.surveyService.findSurveys(surveyIds);
  }

  @Get(`${RESULT_ENDPOINT}:surveyId`)
  async getSurveyResult(@Param('surveyId') surveyId: mongoose.Types.ObjectId) {
    return this.surveyService.getPublicAnswers(surveyId);
  }

  @Get(`open/`)
  async getOpenSurveys(@GetCurrentUsername() username: string) {
    return this.surveyService.findSurveys(await this.usersSurveysService.getOpenSurveyIds(username));
  }

  @Get(`created/`)
  async getCreatedSurveys(@GetCurrentUsername() username: string) {
    return this.surveyService.findSurveys(await this.usersSurveysService.getCreatedSurveyIds(username));
  }

  @Get(`answered/`)
  async getAnsweredSurveys(@GetCurrentUsername() username: string) {
    return this.surveyService.findSurveys(await this.usersSurveysService.getAnsweredSurveyIds(username));
  }

  @Get(All_SURVEYS_ENDPOINT)
  async getAllSurveys() {
    return this.surveyService.getAllSurveys();
  }

  @Get(`answer/:surveyId`)
  async getSurveyAnswer(@Param('surveyId') surveyId: mongoose.Types.ObjectId, @GetCurrentUsername() username: string) {
    return this.usersSurveysService.getCommitedAnswer(username, surveyId);
  }

  @Get(`answer/:surveyId`)
  async getSurveyAnswers(@Param('surveyId') surveyId: mongoose.Types.ObjectId, @Body() body: FindSurveyDto) {
    const { participants = [] } = body;

    const answers: JSON[] = [];
    const promises: Promise<void>[] = participants.map(async (participant: string) => {
      const answer = await this.usersSurveysService.getCommitedAnswer(participant, surveyId);
      if (answer) {
        answers.push(answer);
      } else {
        const error = `Found no answer from ${participant}`;
        // const json = { error };
        JSON.parse(JSON.stringify({ error }));
        answers.push();
      }
    });
    await Promise.all(promises);
    return answers;
  }

  @Post()
  async updateOrCreateSurvey(
    @Body() updateOrCreateSurveyDto: UpdateOrCreateSurveyDto,
    @GetCurrentUsername() username: string,
  ) {
    const {
      id,
      participants = [],
      publicAnswers = [],
      saveNo = 0,
      created = new Date(),
      isAnonymous,
      canSubmitMultipleAnswers,
    } = updateOrCreateSurveyDto;

    const survey: SurveyModel = {
      ...updateOrCreateSurveyDto,
      _id: id,
      participants,
      publicAnswers,
      saveNo,
      created,
      isAnonymous: !!isAnonymous,
      canSubmitMultipleAnswers: !!canSubmitMultipleAnswers,
    };

    const newSurvey = await this.surveyService.updateOrCreateSurvey(survey);

    if (newSurvey) {
      const { _id: newSurveyId } = newSurvey;
      await this.usersSurveysService.addToCreatedSurveys(username, newSurveyId);
      await this.usersSurveysService.populateSurvey(participants, newSurveyId);
    }
  }

  @Get(`${FIND_ONE_ENDPOINT}:surveyId`)
  async findOneSurvey(@Param('surveyId') surveyId: mongoose.Types.ObjectId) {
    return this.surveyService.findOneSurvey(surveyId);
  }

  @Delete()
  async deleteSurvey(@Body() deleteSurveyDto: DeleteSurveyDto) {
    const deleted = this.surveyService.deleteSurveys(deleteSurveyDto.surveyIds);
    await this.usersSurveysService.onRemoveSurvey(deleteSurveyDto.surveyIds);
    return deleted;
  }

  @Patch()
  async answerSurvey(@Body() pushAnswerDto: PushAnswerDto, @GetCurrentUsername() username: string) {
    const { surveyId, answer } = pushAnswerDto;
    await this.surveyService.addPublicAnswer(surveyId, answer);
    return this.usersSurveysService.addAnswer(username, surveyId, answer);
  }
}

export default SurveysController;
