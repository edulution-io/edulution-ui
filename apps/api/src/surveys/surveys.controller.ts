import { Body, Controller, Delete, Get, Logger, Post, Query, Patch } from '@nestjs/common';
import UserSurveySearchTypes from '@libs/survey/types/user-survey-search-types-enum';
import SurveysService from './surveys.service';
import CreateSurveyDto from './dto/create-survey.dto';
import FindSurveyDto from './dto/find-survey.dto';
import PushAnswerDto from './dto/push-answer.dto';
import DeleteSurveyDto from './dto/delete-survey.dto';
import { Survey } from './types/survey.schema';

@Controller('surveys')
class SurveysController {
  constructor(private readonly surveyService: SurveysService) {}

  @Get()
  async find(@Body() body: FindSurveyDto, @Query() params: FindSurveyDto) {
    const { search, surveyId } = params;
    const { surveyIds } = body;

    if (search) {
      switch (search) {
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
  async createOrUpdate(@Body() body: CreateSurveyDto) {
    try {
      const { participants } = body;

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

      return newSurvey;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      Logger.error(`Survey Error (Create/Update): ${error.message}`);
      return error as Error;
    }
  }

  @Delete()
  remove(@Query() deleteSurveyDto: DeleteSurveyDto) {
    const surveyName = deleteSurveyDto.surveyId;
    const deleted = this.surveyService.removeSurvey(surveyName);
    return deleted;
  }

  @Patch()
  async manageUsersSurveys(@Body() body: PushAnswerDto) {
    const { surveyId, answer } = body;

    try {
      // This function does also check if the user is a participant and has not already submitted an answer
      return await this.surveyService.addPublicAnswer(surveyId, answer);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      Logger.error(`Survey Error (Adding Answer): ${error.message}`);
      return error as Error;
    }
  }
}

export default SurveysController;
