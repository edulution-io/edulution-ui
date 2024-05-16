import { Model } from 'survey-core';
import { Body, Controller, Delete, Get, Post, Query, Logger } from '@nestjs/common';
import SurveyService from './survey.service';
import DeleteSurveyDto from './dto/delete-survey.dto';

import UsersSurveysService from './users-surveys.service';
import UserSurveySearchTypes from './types/user-survey-search-types-enum';
import { SurveyAnswer } from './types/users-surveys.schema';
import CreateSurveyDto from './dto/create-survey.dto';
import { Survey } from './types/survey.schema';
import FindSurveyDto from './dto/find-survey.dto';
// import { GetUsername } from '../auth/getUser.ts';

@Controller('surveys')
class SurveysController {
  constructor(
    private readonly surveyService: SurveyService,
    private readonly usersSurveysService: UsersSurveysService,
  ) {}

  @Get()
  async find(@Query() params: FindSurveyDto /* , @GetUsername() username: string */) {
    Logger.log('Fetching surveys with params: ', JSON.stringify(params, null, 2));
    // Logger.log('Fetching surveys with username: ', username);

    // only fetching a specific survey
    if ('surveyname' in params && params.surveyname) {
      return this.surveyService.findSurvey(params.surveyname);
    }

    // fetching multiple specific surveys
    if ('surveynames' in params && params.surveynames) {
      return this.surveyService.findSurveys(params.surveynames);
    }

    // fetch user surveys
    if ('username' in params && params.username) {
      const { search, username } = params;
      switch (search) {
        case UserSurveySearchTypes.OPEN:
          return this.surveyService.findSurveys(await this.usersSurveysService.getOpenSurveys(username));

        case UserSurveySearchTypes.CREATED:
          return this.usersSurveysService.getCreatedSurveys(username);

        case UserSurveySearchTypes.ANSWERED:
          return this.usersSurveysService
            .getAnsweredSurveys(username)
            .then((response) => response.map((surveyAnswer: SurveyAnswer) => surveyAnswer.surveyname))
            .then((surveyNames) => this.surveyService.findSurveys(surveyNames))
            .catch((e) => {
              Logger.error(e);
              return [];
            });
        case UserSurveySearchTypes.ALL:
        default:
          return this.surveyService.findAllSurveys();
      }
    }

    // fetch all surveys
    return this.surveyService.findAllSurveys();
  }

  @Post()
  async createOrUpdate(@Body() createSurveyDto: CreateSurveyDto) {
    const survey = new Model(createSurveyDto.survey);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const newCreateSurveyDto = { ...createSurveyDto, survey: survey.toJSON() };

    const newSurvey: Survey | null = await this.surveyService.updateOrCreateSurvey(newCreateSurveyDto);
    if (newSurvey == null) {
      throw new Error('Survey was not found and we were not able to create a new survey given the parameters');
    }

    const { surveyname, participants } = newSurvey;
    await this.usersSurveysService.populateSurvey(participants, surveyname);
  }

  @Delete()
  remove(@Body() deleteSurveyDto: DeleteSurveyDto) {
    const surveyName = deleteSurveyDto.surveyname;
    return this.surveyService.removeSurvey(surveyName);
  }
}

export default SurveysController;
