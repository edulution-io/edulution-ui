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

import React, { useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { Survey } from 'survey-react-ui';
import { useTranslation } from 'react-i18next';
import {
  ClearFilesEvent,
  ChoicesRestful,
  DownloadFileEvent,
  Model,
  Serializer,
  SurveyModel,
  UploadFilesEvent,
  ValueChangedEvent,
} from 'survey-core';
import MAXIMUM_UPLOAD_FILE_SIZE from '@libs/common/constants/maximumUploadFileSize';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import UpdateRestfulChoicesDto from '@libs/survey/types/api/updateRestfulChoices.dto';
import SURVEYJS_COMMENT_SUFFIX from '@libs/survey/constants/surveyjs-comment-suffix';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import useSseEventListener from '@/hooks/useSseEventListener';
import useLanguage from '@/hooks/useLanguage';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useParticipateSurveyStore from '@/pages/Surveys/Participation/useParticipateSurveyStore';
import useExportSurveyToPdfStore from '@/pages/Surveys/Participation/exportToPdf/useExportSurveyToPdfStore';
import ExportSurveyToPdfDialog from '@/pages/Surveys/Participation/exportToPdf/ExportSurveyToPdfDialog';
import surveyTheme from '@/pages/Surveys/theme/surveyTheme';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import '../theme/custom.participation.css';
import 'survey-core/i18n/french';
import 'survey-core/i18n/german';
import 'survey-core/i18n/italian';
import TSurveyAnswer from '@libs/survey/types/TSurveyAnswer';
import useThemeStore from '@/store/useThemeStore';
import THEME from '@libs/common/constants/theme';

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
Serializer.getProperty('signaturepad', 'signatureWidth').defaultValue = '800';

const SurveyParticipationModel = (props: SurveyParticipationModelProps): React.ReactNode => {
  const { isPublic } = props;
  const { getResolvedTheme } = useThemeStore();

  Serializer.getProperty('signaturepad', 'penColor').defaultValue =
    getResolvedTheme() === THEME.dark ? 'rgba(255, 255, 255, 1)' : 'rgba(17, 24, 39, 1)';

  const { selectedSurvey, updateOpenSurveys, updateAnsweredSurveys } = useSurveyTablesPageStore();

  const {
    fetchAnswer,
    isFetching,
    answerSurvey,
    previousAnswer,
    uploadTempFile,
    deleteTempFile,
    submitAllOtherChoices,
  } = useParticipateSurveyStore();

  const { setIsOpen: setOpenExportPDFDialog } = useExportSurveyToPdfStore();

  const { t } = useTranslation();
  const { language } = useLanguage();

  const pendingOtherChoicesRef = useRef(new Map<string, string>());
  const isCompletingRef = useRef(false);

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

    newModel.addNavigationItem({
      id: 'pdf-export',
      title: t('survey.export.saveInPDF'),
      action: () => setOpenExportPDFDialog(true),
    });

    newModel.onCompleting.add((surveyModel, completingEvent) => {
      if (!selectedSurvey.id) {
        throw new Error(SurveyErrorMessages.MISSING_ID_ERROR);
      }
      if (isCompletingRef.current) {
        return;
      }
      // eslint-disable-next-line no-param-reassign
      completingEvent.allow = false;
      isCompletingRef.current = true;
      const isSurveyPublic = selectedSurvey.isPublic || isPublic || false;

      const submitPendingChoices = async (): Promise<boolean> => {
        const pendingChoices = pendingOtherChoicesRef.current;
        if (pendingChoices.size === 0) {
          return true;
        }
        try {
          const choicesMap = Object.fromEntries(pendingChoices);
          await submitAllOtherChoices(selectedSurvey.id!, choicesMap, isSurveyPublic);
          pendingChoices.clear();
          return true;
        } catch {
          return false;
        }
      };

      void submitPendingChoices().then(async (choicesSucceeded) => {
        if (!choicesSucceeded) {
          isCompletingRef.current = false;
          return;
        }

        const success = await answerSurvey(
          {
            surveyId: selectedSurvey.id!,
            answer: surveyModel.getData() as TSurveyAnswer,
            isPublic: isSurveyPublic,
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
        } else {
          isCompletingRef.current = false;
        }
      });
    });

    newModel.onUploadFiles.add(async (_: SurveyModel, options: UploadFilesEvent): Promise<void> => {
      const { files, callback, question } = options;
      const { id: surveyId, isPublic: surveyIsPublic } = selectedSurvey;

      if (!surveyId || !files?.length || files.some((file) => !file.name?.length)) {
        callback([]);
        return;
      }
      if (files.some((file) => file.size > MAXIMUM_UPLOAD_FILE_SIZE)) {
        toast.error(t('survey.participate.fileSizeExceeded', { size: MAXIMUM_UPLOAD_FILE_SIZE / (1024 * 1024) }));
        callback([]);
        return;
      }
      const isSurveyPublic = surveyIsPublic || isPublic || false;
      const uploadPromises = files.map(async (file) => uploadTempFile(surveyId, question?.name, file, isSurveyPublic));
      const results = await Promise.all(uploadPromises);
      const filteredResults = results.filter((result) => result !== null);
      callback(
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
      const { callback, question, fileName } = options;
      const { id: surveyId, isPublic: surveyIsPublic } = selectedSurvey;

      if (!surveyId) {
        callback('success');
        return;
      }

      const isSurveyPublic = surveyIsPublic || isPublic || false;
      if (fileName === null) {
        try {
          await deleteTempFile(surveyId, question?.name, undefined, isSurveyPublic);
          callback('success');
          return;
        } catch (error) {
          callback('error');
          return;
        }
      }

      let filesToDelete: Array<File & { content?: string }> = [];
      const value = options.value as undefined | (File & { content?: string }) | Array<File & { content?: string }>;
      if (!value) {
        callback('success');
        return;
      }
      if (Array.isArray(value)) {
        if (value.length === 0) {
          callback('success');
          return;
        }
        if (fileName) {
          const file = value.filter((item: File & { content?: string }) => item.name === fileName);
          filesToDelete.push(...file);
        } else {
          filesToDelete = value;
        }
      } else {
        filesToDelete.push(value);
      }

      if (filesToDelete.length === 0) {
        console.error(`File with name ${options.fileName} is not found`);
        callback('error');
        return;
      }

      const results = await Promise.all(
        filesToDelete.map((file: File & { content?: string }) =>
          deleteTempFile(surveyId, question?.name, file, isSurveyPublic),
        ),
      );

      if (results.every((res) => res === 'success')) {
        callback('success');
      } else {
        callback('error');
      }
    });

    return newModel;
  }, [selectedSurvey, language]);

  useEffect(() => {
    if (!surveyParticipationModel || !selectedSurvey?.id) {
      return undefined;
    }
    const handler = (sender: SurveyModel, options: ValueChangedEvent) => {
      const { name } = options;
      if (!name.endsWith(SURVEYJS_COMMENT_SUFFIX)) {
        return;
      }
      const otherValue = options.value as unknown;
      if (typeof otherValue !== 'string' || !otherValue.trim()) {
        return;
      }
      const questionName = name.slice(0, -SURVEYJS_COMMENT_SUFFIX.length);
      const question = sender.getQuestionByName(questionName);
      if (!question || !question.showOtherItem) {
        return;
      }
      pendingOtherChoicesRef.current.set(questionName, otherValue);
    };
    surveyParticipationModel.onValueChanged.add(handler);
    return () => {
      surveyParticipationModel.onValueChanged.remove(handler);
    };
  }, [surveyParticipationModel, selectedSurvey]);

  useSseEventListener(
    SSE_MESSAGE_TYPE.SURVEY_BACKEND_LIMITER_UPDATED,
    (e: MessageEvent<string>) => {
      if (!surveyParticipationModel || !selectedSurvey?.id) {
        return;
      }
      const { surveyId, questionName } = JSON.parse(e.data) as UpdateRestfulChoicesDto;
      if (surveyId !== selectedSurvey.id) {
        return;
      }
      const question = surveyParticipationModel.getQuestionByName(questionName);
      const choicesByUrl = question?.choicesByUrl as ChoicesRestful | undefined;
      if (!choicesByUrl || choicesByUrl.isEmpty) {
        return;
      }
      ChoicesRestful.clearCache();
      choicesByUrl.run();
    },
    {
      enabled: !!surveyParticipationModel && !!selectedSurvey?.id,
      dependencies: [surveyParticipationModel, selectedSurvey],
    },
  );

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
  if (!surveyParticipationModel || !selectedSurvey) {
    return (
      <div className="relative top-1/3">
        <h3 className="flex justify-center">{t('survey.notFound')}</h3>
      </div>
    );
  }
  return (
    <>
      <div className="survey-participation">
        <Survey model={surveyParticipationModel} />
      </div>
      <ExportSurveyToPdfDialog
        formula={selectedSurvey.formula}
        answer={surveyParticipationModel ? (surveyParticipationModel.data as JSON) : undefined}
      />
    </>
  );
};

export default SurveyParticipationModel;
