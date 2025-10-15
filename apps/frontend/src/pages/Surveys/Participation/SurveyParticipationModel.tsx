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

import React, { useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { Survey } from 'survey-react-ui';
import { useTranslation } from 'react-i18next';
import { ClearFilesEvent, DownloadFileEvent, Model, Serializer, SurveyModel, UploadFilesEvent } from 'survey-core';
import { FileDownloadDto } from '@libs/survey/types/api/file-download.dto';
import { removeUuidFromFileName } from '@libs/common/utils/uuidAndFileNames';
import EDU_API_URL from '@libs/common/constants/eduApiUrl';
import SURVEY_ANSWERS_MAXIMUM_FILE_SIZE from '@libs/survey/constants/survey-answers-maximum-file-size';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import useLanguage from '@/hooks/useLanguage';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useParticipateSurveyStore from '@/pages/Surveys/Participation/useParticipateSurveyStore';
import surveyTheme from '@/pages/Surveys/theme/theme';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import '../theme/custom.participation.css';
import 'survey-core/i18n/french';
import 'survey-core/i18n/german';
import 'survey-core/i18n/italian';

interface SurveyFileValue {
  name: string;
  type: string;
  [key: string]: unknown;
}

interface SurveyParticipationModelProps {
  isPublic: boolean;
}

Serializer.getProperty('text', 'textUpdateMode').defaultValue = 'onTyping';
Serializer.getProperty('rating', 'displayMode').defaultValue = 'buttons';
Serializer.getProperty('file', 'storeDataAsText').defaultValue = false;
Serializer.getProperty('file', 'waitForUpload').defaultValue = true;
Serializer.getProperty('file', 'showPreview').defaultValue = true;
Serializer.getProperty('file', 'allowMultiple').defaultValue = false;
Serializer.getProperty('text', 'textUpdateMode').defaultValue = 'onTyping';
Serializer.getProperty('signaturepad', 'penColor').defaultValue = 'rgba(255, 255, 255, 1)';
Serializer.getProperty('signaturepad', 'signatureWidth').defaultValue = '800';

const SurveyParticipationModel = (props: SurveyParticipationModelProps): React.ReactNode => {
  const { isPublic } = props;

  const { selectedSurvey, updateOpenSurveys, updateAnsweredSurveys } = useSurveyTablesPageStore();

  const { fetchAnswer, isFetching, answerSurvey, previousAnswer, uploadTempFile, deleteTempFile } =
    useParticipateSurveyStore();

  const { t } = useTranslation();
  const { language } = useLanguage();

  const surveyParticipationModel = useMemo(() => {
    if (!selectedSurvey || !selectedSurvey.formula) {
      return undefined;
    }
    const newModel = new Model(selectedSurvey.formula);

    newModel.applyTheme(surveyTheme);
    newModel.locale = language;
    if (newModel.pages.length > 3) {
      newModel.showProgressBar = 'top';
    }
    newModel.completedHtml = `${t('survey.participate.completeMessage')}`;

    newModel.onCompleting.add(async (surveyModel, completingEvent) => {
      if (!selectedSurvey.id) {
        throw new Error(SurveyErrorMessages.MISSING_ID_ERROR);
      }
      const success = await answerSurvey(
        {
          surveyId: selectedSurvey.id,
          answer: surveyModel.getData() as JSON,
          isPublic,
        },
        surveyModel,
        completingEvent,
      );

      if (success) {
        if (!isPublic) {
          if (updateOpenSurveys) void updateOpenSurveys();
          if (updateAnsweredSurveys) void updateAnsweredSurveys();
        }
        toast.success(t('survey.participate.saveAnswerSuccess'));
      }
    });

    newModel.onUploadFiles.add(async (_: SurveyModel, options: UploadFilesEvent): Promise<void> => {
      const { files, callback } = options;
      if (!selectedSurvey.id || !files?.length || files.some((file) => !file.name?.length)) {
        return callback([]);
      }
      if (files.some((file) => file.size > SURVEY_ANSWERS_MAXIMUM_FILE_SIZE)) {
        toast.error(
          t('survey.participate.fileSizeExceeded', { size: SURVEY_ANSWERS_MAXIMUM_FILE_SIZE / (1024 * 1024) }),
        );
        return callback([]);
      }

      const uploadPromises = files.map(async (file) => {
        const data = await uploadTempFile(selectedSurvey.id!, file);
        if (data === null) {
          return null;
        }

        const newFile: FileDownloadDto = {
          ...file,
          type: file.type || '*/*',
          originalName: data.name || file.name,
          name: removeUuidFromFileName(data.name || file.name),
          url: `${EDU_API_URL}/${data.url}`,
          content: data.content,
        };
        return newFile;
      });
      const results = await Promise.all(uploadPromises);
      const filteredResults = results.filter((result) => result !== null);
      return callback(
        filteredResults.map((result) => ({
          file: result,
          content: result.url,
        })),
      );
    });

    newModel.onDownloadFile.add((_: SurveyModel, options: DownloadFileEvent) => {
      const fileValue = options.fileValue as SurveyFileValue;

      fetch(options.content as string)
        .then((response) => response.blob())
        .then((blob) => {
          const file = new File([blob], fileValue.name, {
            type: fileValue.type,
          });
          const reader = new FileReader();
          reader.onload = (e) => {
            options.callback('success', e.target?.result);
          };
          reader.readAsDataURL(file);
        })
        .catch((error) => {
          console.error('Error: ', error);
          options.callback('error');
        });
    });

    newModel.onClearFiles.add(async (_surveyModel: SurveyModel, options: ClearFilesEvent): Promise<void> => {
      let filesToDelete: File[] = [];
      if (Array.isArray(options.value)) {
        if (options.value.length === 0) {
          options.callback('success');
          return;
        }
        const files = options.value as File[];
        filesToDelete = files.filter((item: File) =>
          options.fileName === null ? true : item.name === options.fileName,
        );
      } else {
        if (!options.value) {
          options.callback('success');
          return;
        }
        const file = options.value as File;
        filesToDelete = [file];
      }
      if (filesToDelete.length === 0) {
        toast.error(t('common.errors.fileDeletionFailed'));
        options.callback('error');
        return;
      }

      const result = await Promise.all(
        filesToDelete.map((file: File) => {
          if (!selectedSurvey || !selectedSurvey.id) {
            options.callback('error');
            return Promise.resolve('error');
          }
          return deleteTempFile(selectedSurvey.id, file, options.callback);
        }),
      );
      if (result.every((res: string | undefined) => res === 'success')) {
        options.callback('success');
      } else {
        options.callback('error');
      }
    });

    return newModel;
  }, [selectedSurvey, language]);

  useEffect(() => {
    if (!selectedSurvey?.id) {
      return;
    }
    if (!selectedSurvey.canUpdateFormerAnswer) {
      return;
    }
    void fetchAnswer(selectedSurvey.id);
  }, [selectedSurvey]);

  useEffect(() => {
    if (surveyParticipationModel && previousAnswer) {
      surveyParticipationModel.data = previousAnswer.answer;
    }
  }, [surveyParticipationModel, previousAnswer]);

  if (isFetching) {
    return <LoadingIndicatorDialog isOpen />;
  }
  if (!surveyParticipationModel) {
    return (
      <div className="relative top-1/3">
        <h4 className="flex justify-center">{t('survey.notFound')}</h4>
      </div>
    );
  }
  return (
    <div className="survey-participation">
      <Survey model={surveyParticipationModel} />
    </div>
  );
};

export default SurveyParticipationModel;
