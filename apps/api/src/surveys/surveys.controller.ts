import { Body, Controller, Delete, Get, Logger, Post, Query, Patch } from '@nestjs/common';
import UserSurveySearchTypes from '@libs/survey/types/user-survey-search-types-enum';
import SurveysService from './surveys.service';
import UsersSurveysService from './users-surveys.service';
import CreateSurveyDto from './dto/create-survey.dto';
import FindSurveyDto from './dto/find-survey.dto';
import PushAnswerDto from './dto/push-answer.dto';
import DeleteSurveyDto from './dto/delete-survey.dto';
import { Survey } from './types/survey.schema';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';

@Controller('surveys')
class SurveysController {
  constructor(
    private readonly surveyService: SurveysService,
    private readonly usersSurveysService: UsersSurveysService,
  ) {}

  @Get()
  async find(@Body() body: FindSurveyDto, @Query() params: FindSurveyDto, @GetCurrentUsername() username: string) {
    const { search, surveyId } = params;
    const { surveyIds, participants  } = body;

    if (search) {
      switch (search) {
        case UserSurveySearchTypes.OPEN:
          return this.surveyService.findSurveys(await this.usersSurveysService.getOpenSurveyIds(username));

        case UserSurveySearchTypes.CREATED:
          return this.surveyService.findSurveys(await this.usersSurveysService.getCreatedSurveyIds(username));

        case UserSurveySearchTypes.ANSWERS:
          if (!surveyId) {
            throw new Error('The surveyId is required for this search type');
          }
          try {
            const survey = await this.surveyService.findSurvey(surveyId);
            if (!survey) {
              throw new Error('Survey not found');
            }
            return survey.publicAnswers;
          } catch (error) {
            Logger.error(error);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return error;
          }

        case UserSurveySearchTypes.ANSWER:
          if (!surveyId) {
            throw new Error('The surveyId is required for this search type');
          }
          if (participants && participants.length > 1) {
            try {
              const answers: JSON[] = [];
              const promises: Promise<void>[] = participants.map(async (participant: string) => {
                const answer = await this.usersSurveysService.getCommitedAnswer(participant, surveyId);
                if (answer) {
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
            const answer = await this.usersSurveysService.getCommitedAnswer(username, surveyId);
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
            .getAnsweredSurveyIds(username)
            .then((resultingSurveyIds: number[]) => this.surveyService.findSurveys(resultingSurveyIds))
            .catch((e: Error) => {
              Logger.error(e);
              return [];
            });


        case UserSurveySearchTypes.ALL:
        default:
          return this.surveyService.findAllSurveys();
      }
    }

    // only fetching a specific survey
    if (surveyId) {
      return this.surveyService.findSurvey(surveyId);
    }

    // fetching multiple specific surveys
    if (surveyIds) {
      return this.surveyService.findSurveys(surveyIds);
    }

    // fetch all surveys
    return this.surveyService.findAllSurveys();
  }

  @Post()
  async createOrUpdate(@Body() body: CreateSurveyDto, @GetCurrentUsername() username: string) {
    try {
      const { participants = [] } = body;

      const createSurveyDto: Survey = {
        ...body,
        formula: body.formula,
        participants,
        publicAnswers: body.publicAnswers || [],
        saveNo: body.saveNo || 0,
        created: body.created || new Date(),
        expirationDate: body.expirationDate,
        expirationTime: body.expirationTime?.toString(),
        isAnonymous: !!body.isAnonymous,
        canSubmitMultipleAnswers: !!body.canSubmitMultipleAnswers,
      };

      const newSurvey: Survey | null = await this.surveyService.updateOrCreateSurvey(createSurveyDto);
      if (newSurvey == null) {
        throw new Error('Survey was not found and we were not able to create a new survey given the parameters');
      }

      const { id } = newSurvey;
      await this.usersSurveysService.addToCreatedSurveys(username, id);
      await this.usersSurveysService.populateSurvey(participants, id);

      return newSurvey;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      Logger.error(`Survey Error (Create/Update): ${error.message}`);
      return error as Error;
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
    const {surveyId, answer, canSubmitMultipleAnswers} = body;

    try {
      // This function does also check if the user is a participant and has not already submitted an answer
      await this.surveyService.addPublicAnswer(surveyId, answer, username);

      return await this.usersSurveysService.addAnswer(username, surveyId, answer, canSubmitMultipleAnswers);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      Logger.error(`Survey Error (Adding Answer): ${error.message}`);
      return error as Error;
    }
  }
}

export default SurveysController;
