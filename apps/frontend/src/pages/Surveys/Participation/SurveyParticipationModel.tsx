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
import { ClearFilesEvent, Model, Serializer, SurveyModel, UploadFilesEvent } from 'survey-core';
import { Survey } from 'survey-react-ui';
import { useTranslation } from 'react-i18next';
import EDU_API_URL from '@libs/common/constants/eduApiUrl';
import surveyAnswerMaximumFileSize from '@libs/survey/constants/survey-answer-max-file-size';
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

interface SurveyParticipationModelProps {
  isPublic: boolean;
}

Serializer.getProperty('rating', 'displayMode').defaultValue = 'buttons';
Serializer.getProperty('file', 'storeDataAsText').defaultValue = false;
Serializer.getProperty('file', 'waitForUpload').defaultValue = true;
Serializer.getProperty('file', 'showPreview').defaultValue = true;

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
          saveNo: selectedSurvey.saveNo,
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
      if (!files || files.length === 0) {
        callback([]);
        return;
      }
      if (files.some((file) => !file.name || file.name.length === 0)) {
        callback([]);
        return;
      }
      if (files.some((file) => file.size > surveyAnswerMaximumFileSize)) {
        callback([]);
        return;
      }

      const fileNames = files.map((file) => file.name);
      const uploadPromises: Promise<{ fileName: string; data: string }>[] = files.map(async (file) => {
        if (!selectedSurvey || !selectedSurvey.id) {
          return Promise.resolve({ fileName: file.name, data: '' });
        }
        return uploadTempFile(selectedSurvey.id, file);
      });
      const data = await Promise.all(uploadPromises);
      callback(
        fileNames.map((fileName): { file: string; content: string } => {
          const suffix = data.find((item) => item?.fileName === fileName);
          return {
            file: suffix?.fileName || fileName,
            content: `${EDU_API_URL}/${suffix?.data}`,
          };
        }),
      );
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
