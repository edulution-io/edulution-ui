import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import SurveyService from './surveyService';
import UsersSurveysService from './users-surveys.service';
import CreateSurveyDto from './dto/create-survey.dto';
import UpdateSurveyDto from './dto/update-survey.dto';
import { Survey } from './survey.schema';

@Controller('survey')
class SurveysController {
  constructor(
    private readonly surveyService: SurveyService,
    private readonly usersSurveysService: UsersSurveysService,
  ) {}

  @Post()
  async create(@Body() createSurveyDto: CreateSurveyDto) {
    const newSurvey: Survey = await this.surveyService.createSurvey(createSurveyDto);
    const { surveyname, participants } = newSurvey;
    await this.usersSurveysService.populateSurvey(participants, surveyname);
  }

  @Post()
  change(@Body() surveyName: string, createSurveyDto: CreateSurveyDto) {
    return this.surveyService.updateSurvey(surveyName, createSurveyDto);
  }

  @Get()
  findAll() {
    return this.surveyService.findAllSurveys();
  }

  @Get(':surveyName')
  findOne(@Param('surveyName') surveyName: string) {
    return this.surveyService.findSurvey(surveyName);
  }

  @Patch(':surveyName')
  update(@Param('surveyName') surveyName: string, @Body() updateSurveyDto: UpdateSurveyDto) {
    return this.surveyService.updateSurvey(surveyName, updateSurveyDto);
  }

  @Delete(':surveyName')
  remove(@Param('surveyName') surveyName: string) {
    return this.surveyService.removeSurvey(surveyName);
  }

  @Get(':surveyName')
  async getAnswers(@Param('surveyName') surveyName: string, @Body() isAnonym = true) {
    const survey = await this.surveyService.findSurvey(surveyName);
    if (survey == null) {
      throw new Error('Survey not found');
    }

    const promises: Promise<{ surveyname: string; answer: JSON | string }>[] = [];
    survey.participants.forEach((participant) => {
      promises.push(this.usersSurveysService.getAnswer(participant, surveyName, isAnonym));
    });

    const results = await Promise.all(promises);

    return results;
  }

  @Patch(':username/:surveyName')
  addAnswer(@Param('username') username: string, @Param('surveyName') surveyName: string, @Body() answer: JSON) {
    return this.usersSurveysService.addAnswer(username, surveyName, answer);
  }
}

export default SurveysController;
