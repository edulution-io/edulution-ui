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

import { join } from 'path';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { HttpStatus, Injectable } from '@nestjs/common';
import SurveyTemplateDto from '@libs/survey/types/api/surveyTemplate.dto';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import getCurrentDateTimeString from '@libs/common/utils/Date/getCurrentDateTimeString';
import SURVEYS_TEMPLATE_PATH from '@libs/survey/constants/surveysTemplatePath';
// import SURVEYS_DEFAULT_TEMPLATE_PATH from '@libs/survey/constants/surveysDefaultTemplatePath';
import { surveyTemplate01, surveyTemplate02, surveyTemplate03, surveyTemplate04 } from "./assets/templates";
import CustomHttpException from '../common/CustomHttpException';
import FilesystemService from '../filesystem/filesystem.service';

@Injectable()
class SurveysTemplateService {
  constructor(private fileSystemService: FilesystemService) {}

  async createTemplate(surveyTemplateDto: SurveyTemplateDto): Promise<void> {
    let filename = surveyTemplateDto.fileName;
    if (!filename) {
      const dateTimeString = getCurrentDateTimeString();
      filename = `${dateTimeString}_-_${uuidv4()}.SurveyTemplate.json`;
    }
    const templatePath = join(SURVEYS_TEMPLATE_PATH, filename);
    try {
      await this.fileSystemService.ensureDirectoryExists(SURVEYS_TEMPLATE_PATH);
      return await FilesystemService.writeFile(templatePath, JSON.stringify(surveyTemplateDto, null, 2));
    } catch (error) {
      throw new CustomHttpException(
        CommonErrorMessages.FILE_WRITING_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        SurveysTemplateService.name,
      );
    }
  }

  async serveTemplateNames(): Promise<string[]> {
    return this.fileSystemService.getAllFilenamesInDirectory(SURVEYS_TEMPLATE_PATH);
  }

  async serveTemplate(fileName: string, res: Response): Promise<Response> {
    const templatePath = join(SURVEYS_TEMPLATE_PATH, fileName);
    const fileStream = await this.fileSystemService.createReadStream(templatePath);
    fileStream.pipe(res);
    return res;
  }

  // async ensureDefaultTemplatesExist(): Promise<void> {
  //   const defaultTemplateFilenames = await this.fileSystemService.getAllFilenamesInDirectory(
  //     SURVEYS_DEFAULT_TEMPLATE_PATH
  //   );
  //   const defaultTemplates = await Promise.all(
  //     defaultTemplateFilenames.map(async (filename) => {
  //       const filePath = join(SURVEYS_DEFAULT_TEMPLATE_PATH, filename);
  //       const content = await FilesystemService.readFile(filePath);
  //       return JSON.parse(JSON.stringify(content.toString())) as SurveyTemplateDto;
  //     })
  //   );
  //   const activeDefaultTemplates = defaultTemplates.filter((template) => !template.disabled);
  //   const promises = activeDefaultTemplates.map((template) =>
  //     template.fileName
  //       ? FilesystemService.writeFile(join(SURVEYS_TEMPLATE_PATH, template.fileName), JSON.stringify(template, null, 2))
  //       : Promise.resolve(),
  //   );
  //   await Promise.all(promises);
  // }

  serveDefaultTemplates(): SurveyTemplateDto[] {
    const defaultTemplates: SurveyTemplateDto[] = [
      surveyTemplate01 as unknown as SurveyTemplateDto,
      surveyTemplate02 as unknown as SurveyTemplateDto,
      surveyTemplate03 as unknown as SurveyTemplateDto,
      surveyTemplate04 as unknown as SurveyTemplateDto,
    ];
    return defaultTemplates.filter((template) => !template.disabled);
  }
}

export default SurveysTemplateService;
