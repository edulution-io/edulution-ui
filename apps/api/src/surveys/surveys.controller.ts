import mongoose from 'mongoose';
import { Body, Controller, Delete, Get, Logger, Post, Query, Patch, Param } from '@nestjs/common';
import SurveysService from './surveys.service';
import UsersSurveysService from './users-surveys.service';
import CreateSurveyDto from './dto/create-survey.dto';
import FindSurveyDto from './dto/find-survey.dto';
import PushAnswerDto from './dto/push-answer.dto';
import DeleteSurveyDto from './dto/delete-survey.dto';
import { Survey } from './types/survey.schema';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';
import SurveyAnswerNotFoundError from './errors/survey-answer-not-found-error';
import NeitherFoundNorCreatedSurveyError from './errors/neither-found-nor-created-survey-error';

@Controller('surveys')
class SurveysController {
  constructor(
    private readonly surveyService: SurveysService,
    private readonly usersSurveysService: UsersSurveysService,
  ) {}

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

  @Get(`answer/:surveyId`)
  async getSurveyAnswer(@Param('surveyId') surveyId: mongoose.Types.ObjectId, @GetCurrentUsername() username: string) {
    const answer = await this.usersSurveysService.getCommitedAnswer(username, surveyId);
    if (!answer) {
      throw SurveyAnswerNotFoundError;
    }
    return answer;
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

    if (!answers) {
      throw SurveyAnswerNotFoundError;
    }
    return answers;
  }

  @Post()
  async createOrUpdate(@Body() body: CreateSurveyDto, @GetCurrentUsername() username: string) {
    try {
      const { participants = [], publicAnswers = [], saveNo = 0, created = new Date() } = body;

      const createSurveyDto: CreateSurveyDto = {
        ...body,
        participants,
        publicAnswers,
        saveNo,
        created,
        expirationTime: body.expirationTime?.toString(),
        isAnonymous: !!body.isAnonymous,
        canSubmitMultipleAnswers: !!body.canSubmitMultipleAnswers,
      };

      const newSurvey: Survey | null = await this.surveyService.updateOrCreateSurvey(createSurveyDto);
      if (newSurvey == null) {
        throw NeitherFoundNorCreatedSurveyError;
      }

      const { _id: newSurveyId } = newSurvey;
      await this.usersSurveysService.addToCreatedSurveys(username, newSurveyId);
      await this.usersSurveysService.populateSurvey(participants, newSurveyId);

      return newSurvey;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      Logger.error(`Survey: Create or update error: ${error.message}`);
      throw error;
    }
  }

  @Delete()
  async remove(@Query() deleteSurveyDto: DeleteSurveyDto) {
    const surveyName = deleteSurveyDto.surveyId;
    const deleted = this.surveyService.removeSurvey(surveyName);
    await this.usersSurveysService.onRemoveSurvey(surveyName);
    return deleted;
  }

  @Patch()
  async manageUsersSurveys(@Body() body: PushAnswerDto, @GetCurrentUsername() username: string) {
    const { surveyId, answer, canSubmitMultipleAnswers } = body;

    try {
      // This function does also check if the user is a participant and has not already submitted an answer
      await this.surveyService.addPublicAnswer(surveyId, answer, username);

      return await this.usersSurveysService.addAnswer(username, surveyId, answer, canSubmitMultipleAnswers);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      Logger.error(`Survey: Manage user surveys error: ${error.message}`);
      throw error;
    }
  }
}

export default SurveysController;
