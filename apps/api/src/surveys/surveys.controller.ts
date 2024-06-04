// import { Model } from 'survey-core';
import { Body, Controller, Delete, Get, Logger, Post, Query, Patch } from '@nestjs/common';
import SurveyService from './survey.service';
import DeleteSurveyDto from './dto/delete-survey.dto';

import UsersSurveysService from './users-surveys.service';
import UserSurveySearchTypes from './types/user-survey-search-types-enum';
import { Survey } from './types/survey.schema';
import { SurveyAnswer } from './types/users-surveys.schema';
import CreateSurveyDto from './dto/create-survey.dto';
import FindSurveyDto from './dto/find-survey.dto';
import PushAnswerDto from './dto/push-answer.dto';
import { GetUsername } from '../common/decorators/getUser.decorator';

@Controller('surveys')
class SurveysController {
  constructor(
    private readonly surveyService: SurveyService,
    private readonly usersSurveysService: UsersSurveysService,
  ) {}

  @Get()
  async find(@Body() body: FindSurveyDto, @Query() params: FindSurveyDto, @GetUsername() username: string) {
    const { search, surveyname } = params;
    const { surveynames, participants/*, isAnonymous*/ } = body;
    if (search) {
      switch (search) {
        case UserSurveySearchTypes.OPEN:
          return this.surveyService.findSurveys(await this.usersSurveysService.getOpenSurveyNames(username));

        case UserSurveySearchTypes.CREATED:
          return this.surveyService.findSurveys(await this.usersSurveysService.getCreatedSurveyNames(username));

        case UserSurveySearchTypes.ANSWERS:
          if (!surveyname) {
            throw new Error('Survey name is required for this search type');
          }
          try {
            const survey = await this.surveyService.findSurvey(surveyname);
            if (!survey) {
              throw new Error('Survey not found');
            }
            return survey.anonymousAnswers;
          } catch (error) {
            Logger.error(error);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return error;
          }

        case UserSurveySearchTypes.ANSWER:
          if (!surveyname) {
            throw new Error('Survey name is required for this search type');
          }
          if (participants && participants.length > 1) {
            try {
              const answers: string[] = [];
              const promises: Promise<void>[] = participants.map(async (participant: string) => {
                const answer = await this.usersSurveysService.getAnswer(participant, surveyname);
                if (!!answer) {
                  answers.push(answer);
                }
              });
              await Promise.all(promises);

              if (!answers) {
                throw new Error('Survey answers not found');
              }
              return answers;
            } catch (error) {
              Logger.error(error);
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              return error;
            }
          }
          try {
            const answer = await this.usersSurveysService.getAnswer(username, surveyname);
            if (!answer) {
              throw new Error('Survey answer not found');
            }
            return answer;
          } catch (error) {
            Logger.error(error);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return error;
          }

        case UserSurveySearchTypes.ANSWERED:
          return this.usersSurveysService
            .getAnswers(username)
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

    // only fetching a specific survey
    if (surveyname) {
      return this.surveyService.findSurvey(surveyname);
    }

    // fetching multiple specific surveys
    if (surveynames) {
      return this.surveyService.findSurveys(surveynames);
    }

    // fetch all surveys
    return this.surveyService.findAllSurveys();
  }

  @Post()
  async createOrUpdate(
    @Body() body: CreateSurveyDto,
    @GetUsername() username: string
  ) {
    try {
      const { participants } = body;

      const participantList = participants.map((participant) => participant.username);

      const createSurveyDto: Survey = {
        ...body,
        survey: JSON.parse(body.survey),
        participants: participantList,
        anonymousAnswers: body.anonymousAnswers ? body.anonymousAnswers : [],
        saveNo: body.saveNo ? body.saveNo.toString() : '0',
        created: body.created ? body.created.toString() : new Date().toString(),
        expires: body.expires ? body.expires.toString() : undefined,
        isAnonymous: body.isAnonymous ? body.isAnonymous : false,
        canSubmitMultipleAnswers: body.canSubmitMultipleAnswers ? body.canSubmitMultipleAnswers : false,
      };

      const newSurvey: Survey | null = await this.surveyService.updateOrCreateSurvey(createSurveyDto);
      if (newSurvey == null) {
        throw new Error('Survey was not found and we were not able to create a new survey given the parameters');
      }

      const {surveyname} = newSurvey;
      await this.usersSurveysService.addToCreatedSurveys(username, surveyname);
      await this.usersSurveysService.populateSurvey(participantList, surveyname);

      return newSurvey;
    } catch (error) {
      Logger.error(error);
      return error;
    }
  }

  @Delete()
  remove(@Body() deleteSurveyDto: DeleteSurveyDto) {
    const surveyName = deleteSurveyDto.surveyname;
    // this.usersSurveysService.onRemoveSurvey(surveyName);
    return this.surveyService.removeSurvey(surveyName);
  }

  @Patch()
  async manageUsersSurveys(
    @Body() body: PushAnswerDto,
    @GetUsername() username: string,
  ) {

    const { surveyname, answer, canSubmitMultipleAnswers = false } = body;

    await this.surveyService.addAnonymousAnswer(surveyname, answer /* , username */ );

    if (!canSubmitMultipleAnswers) {
      await this.usersSurveysService.moveSurveyFromOpenToAnsweredSurveys(username, surveyname, answer);
    } else {
      await this.usersSurveysService.addToAnsweredSurveys(username, surveyname);
    }

    return await this.usersSurveysService.addAnswer(username, surveyname, answer, canSubmitMultipleAnswers);
  }
}

export default SurveysController;
