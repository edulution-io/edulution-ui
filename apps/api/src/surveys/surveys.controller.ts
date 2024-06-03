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
import { User } from '../users/user.schema';

@Controller('surveys')
class SurveysController {
  constructor(
    private readonly surveyService: SurveyService,
    private readonly usersSurveysService: UsersSurveysService,
  ) {}

  @Get()
  async find(@Body() body: FindSurveyDto, @Query() params: FindSurveyDto, @GetUsername() username: string) {
    const { search, surveyname, surveynames } = params;
    if (search) {
      switch (search) {
        case UserSurveySearchTypes.OPEN:
          return this.surveyService.findSurveys(await this.usersSurveysService.getOpenSurveyNames(username));

        case UserSurveySearchTypes.CREATED:
          return this.surveyService.findSurveys(await this.usersSurveysService.getCreatedSurveyNames(username));

        case UserSurveySearchTypes.ANSWER:
          if (!surveyname) {
            throw new Error('Survey name is required for this search type');
          }

          const { participants, isAnonymous } = body;
          if (isAnonymous) {
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

              Logger.log(answers);

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
  async createOrUpdate(@Body() body: CreateSurveyDto, @GetUsername() username: string) {
    try {
      const newSurvey: Survey | null = await this.surveyService.updateOrCreateSurvey(body);
      if (newSurvey == null) {
        throw new Error('Survey was not found and we were not able to create a new survey given the parameters');
      }

      const { surveyname, participants } = newSurvey;
      await this.usersSurveysService.addToCreatedSurveys(username, surveyname);
      await this.usersSurveysService.populateSurvey(participants, surveyname);

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
    @Query() pushAnswerDto: PushAnswerDto,
    @GetUsername() username: string,
  ) {
    const { surveyname, answer } = pushAnswerDto;

    const { isAnonymous, canSubmitMultipleAnswers } = body;

    if (isAnonymous) {
      await this.surveyService.addAnonymousAnswer(surveyname, answer);

      let user: User | null = null;
      if (!canSubmitMultipleAnswers) {
        user = await this.usersSurveysService.moveSurveyFromOpenToAnsweredSurveys(username, surveyname, answer);
      } else {
        user = await this.usersSurveysService.addToAnsweredSurveys(username, surveyname);
      }
      return user;
    }

    return await this.usersSurveysService.addAnswer(username, surveyname, answer, canSubmitMultipleAnswers);
  }
}

export default SurveysController;
