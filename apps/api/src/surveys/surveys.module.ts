/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import SurveysTemplateSchema, { SurveysTemplate } from 'apps/api/src/surveys/surveys-template.schema';
import SurveySchema, { Survey } from './survey.schema';
import SurveyAnswersSchema, { SurveyAnswer } from './survey-answers.schema';
import SurveysService from './surveys.service';
import SurveysController from './surveys.controller';
import SurveyAnswersService from './survey-answers.service';
import PublicSurveysController from './public-surveys.controller';
import GroupsModule from '../groups/groups.module';
import SurveysAttachmentService from './surveys-attachment.service';
import SurveyAnswerAttachmentsService from './survey-answer-attachments.service';
import SurveysTemplateService from './surveys-template.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Survey.name, schema: SurveySchema }]),
    MongooseModule.forFeature([{ name: SurveyAnswer.name, schema: SurveyAnswersSchema }]),
    MongooseModule.forFeature([{ name: SurveysTemplate.name, schema: SurveysTemplateSchema }]),
    GroupsModule,
  ],
  controllers: [SurveysController, PublicSurveysController],
  providers: [
    SurveysService,
    SurveyAnswersService,
    SurveysTemplateService,
    SurveysAttachmentService,
    SurveyAnswerAttachmentsService,
  ],
})
export default class SurveysModule {}
