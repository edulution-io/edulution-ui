/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import SurveySchema, { Survey } from './survey.schema';
import SurveyAnswerSchema, { SurveyAnswer } from './survey-answer.schema';
import SurveysTemplateSchema, { SurveysTemplate } from 'apps/api/src/surveys/surveys-template.schema';
import SurveysService from './surveys.service';
import SurveysController from './surveys.controller';
import SurveyAnswerService from './survey-answer.service';
import PublicSurveysController from './public-surveys.controller';
import GroupsModule from '../groups/groups.module';
import SurveysAttachmentService from './surveys-attachment.service';
import SurveysTemplateService from './surveys-template.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Survey.name, schema: SurveySchema }]),
    MongooseModule.forFeature([{ name: SurveyAnswer.name, schema: SurveyAnswerSchema }]),
    MongooseModule.forFeature([{ name: SurveysTemplate.name, schema: SurveysTemplateSchema }]),
    GroupsModule,
  ],
  controllers: [SurveysController, PublicSurveysController],
  providers: [SurveysService, SurveyAnswerService, SurveysTemplateService, SurveysAttachmentService],
})
export default class SurveysModule {}
