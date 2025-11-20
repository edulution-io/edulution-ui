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
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { VscNewFile } from 'react-icons/vsc';
import { RiResetLeftLine } from 'react-icons/ri';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { TbFileTypePdf, TbTemplate } from 'react-icons/tb';
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react';
import TSurveyQuestion from '@libs/survey/types/TSurveyQuestion';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import AttendeeDto from '@libs/user/types/attendee.dto';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import { CREATED_SURVEYS_PAGE } from '@libs/survey/constants/surveys-endpoint';
import getSurveyEditorFormSchema from '@libs/survey/types/editor/getSurveyEditorForm.schema';
import surveysDefaultValues from '@libs/survey/constants/surveys-default-values';
import getInitialSurveyFormValues from '@/pages/Surveys/utils/getInitialSurveyFormValues';
import useUserStore from '@/store/UserStore/useUserStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import useLanguage from '@/hooks/useLanguage';
import useBeforeUnload from '@/hooks/useBeforeUnload';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import SaveSurveyDialog from '@/pages/Surveys/Editor/dialog/SaveSurveyDialog';
import createSurveyCreatorObject from '@/pages/Surveys/Editor/createSurveyCreatorObject';
import TemplateDialog from '@/pages/Surveys/Editor/dialog/TemplateDialog';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import SaveButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/saveButton';
import PageLayout from '@/components/structure/layout/PageLayout';
import QuestionsContextMenu from '@/pages/Surveys/Editor/dialog/QuestionsContextMenu';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import useExportSurveyToPdfStore from '@/pages/Surveys/Participation/exportToPdf/useExportSurveyToPdfStore';
import ExportSurveyToPdfDialog from '@/pages/Surveys/Participation/exportToPdf/ExportSurveyToPdfDialog';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';

const SurveyEditorPage = () => {
  const { fetchSelectedSurvey, isFetching, selectedSurvey, selectSurvey, updateUsersSurveys } =
    useSurveyTablesPageStore();
  const {
    isOpenSaveSurveyDialog,
    setIsOpenSaveSurveyDialog,
    updateOrCreateSurvey,
    isLoading,
    reset: resetEditorPage,
    storedSurvey,
    updateStoredSurvey,
    resetStoredSurvey,
    uploadFile,
  } = useSurveyEditorPageStore();
  const { reset: resetTemplateStore, isOpenTemplateMenu, setIsOpenTemplateMenu } = useTemplateMenuStore();
  const {
    reset: resetQuestionsContextMenu,
    setIsOpenQuestionContextMenu,
    isOpenQuestionContextMenu,
    setSelectedQuestion,
    isUpdatingBackendLimiters,
  } = useQuestionsContextMenuStore();
  const { setIsOpen: setOpenExportPDFDialog } = useExportSurveyToPdfStore();

  const { t } = useTranslation();
  const { user } = useUserStore();
  const { surveyId } = useParams();
  const { language } = useLanguage();

  const handleReset = () => {
    resetStoredSurvey();
    resetEditorPage();
    resetTemplateStore();
    resetQuestionsContextMenu();
    selectSurvey(undefined);
  };

  useEffect(() => {
    handleReset();
    void fetchSelectedSurvey(surveyId, false);
  }, [surveyId]);

  const initialFormValues: SurveyDto | undefined = useMemo(() => {
    if (!user || !user.username) return undefined;
    const surveyCreator: AttendeeDto = {
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      value: user.username,
      label: `${user.firstName} ${user.lastName}`,
    };
    return getInitialSurveyFormValues(surveyCreator, selectedSurvey, storedSurvey);
  }, [storedSurvey, selectedSurvey]);

  const form = useForm<SurveyDto>({
    mode: 'onChange',
    resolver: zodResolver(getSurveyEditorFormSchema()),
    defaultValues: initialFormValues,
  });

  useEffect(() => {
    form.reset(initialFormValues);
  }, [initialFormValues]);

  const creatorRef = useRef<SurveyCreator | null>(null);
  if (!creatorRef.current) {
    creatorRef.current = createSurveyCreatorObject(language);
  }
  const creator = creatorRef.current;

  const updateSurveyStorage = () => {
    if (!creator) return;
    const formula = creator.JSON as SurveyFormula;
    const saveNo = creator.saveNo || 0;
    updateStoredSurvey({
      ...form.getValues(),
      formula,
      saveNo,
    });
  };
  useBeforeUnload('unload', updateSurveyStorage);

  useEffect(() => {
    if (!creator) return;
    creator.locale = language;
    creator.saveNo = form.getValues('saveNo');
    creator.JSON = form.getValues('formula');
    creator.saveSurveyFunc = updateSurveyStorage;

    creator.onDefineElementMenuItems.add((creatorModel, options) => {
      const settingsItemIndex = options.items.findIndex((option) => option.id === 'settings');
      if (settingsItemIndex !== -1) {
        // eslint-disable-next-line no-param-reassign
        options.items[settingsItemIndex].visibleIndex = 10;
        // eslint-disable-next-line no-param-reassign
        options.items[settingsItemIndex].title = t('survey.editor.questionSettings.settings');
        // eslint-disable-next-line no-param-reassign
        options.items[settingsItemIndex].action = () => {
          if (creatorModel.isObjQuestion(creatorModel.selectedElement)) {
            setIsOpenQuestionContextMenu(true);
            setSelectedQuestion(creatorModel.selectedElement as unknown as TSurveyQuestion);
          }
        };

        const doubleItemIndex = options.items.findIndex((option) => option.id === 'duplicate');
        if (doubleItemIndex !== -1) {
          // eslint-disable-next-line no-param-reassign
          options.items[doubleItemIndex].visibleIndex = 20;
        }
      }
    });

    creator.onUploadFile.add(async (_creatorModel, options) => {
      const promises = options.files.map((file: File) => uploadFile(file, options.callback));
      await Promise.all(promises);
    });
  }, [creator, form, language]);

  const handleNavigateToCreatedSurveys = () => {
    window.history.pushState(null, '', `/${CREATED_SURVEYS_PAGE}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleSaveSurvey = async () => {
    if (!creator) return;

    const formula = creator.JSON as SurveyFormula;
    const saveNo = creator.saveNo || 0;
    const success = await updateOrCreateSurvey({
      ...form.getValues(),
      formula,
      saveNo,
    });
    if (success) {
      void updateUsersSurveys();
      setIsOpenSaveSurveyDialog(false);

      resetStoredSurvey();

      toast.success(t('survey.editor.saveSurveySuccess'));
      handleNavigateToCreatedSurveys();
    }
  };

  const config: FloatingButtonsBarConfig = {
    buttons: [
      SaveButton(() => setIsOpenSaveSurveyDialog(true)),
      {
        icon: TbTemplate,
        text: t('survey.editor.templates'),
        onClick: () => setIsOpenTemplateMenu(!isOpenTemplateMenu),
      },
      {
        icon: VscNewFile,
        text: t('survey.editor.new'),
        onClick: () => {
          handleReset();
          form.reset(initialFormValues);
          if (creator) {
            creator.saveNo = 0;
            creator.JSON = surveysDefaultValues.formula;
          }
        },
      },
      {
        icon: RiResetLeftLine,
        text: t('survey.editor.reset'),
        onClick: () => {
          handleReset();
          form.reset(initialFormValues);
          if (creator) {
            creator.saveNo = form.getValues('saveNo');
            creator.JSON = form.getValues('formula');
          }
        },
      },
      {
        icon: TbFileTypePdf,
        text: t('survey.export.exportToPDF'),
        onClick: () => setOpenExportPDFDialog(true),
      },
    ],
    keyPrefix: 'surveys-page-floating-button_',
  };

  if (isLoading || isFetching) return <LoadingIndicatorDialog isOpen />;

  return (
    <PageLayout>
      <div className="survey-editor h-full">
        {creator && (
          <SurveyCreatorComponent
            creator={creator}
            style={{ height: '100%', width: '100%' }}
          />
        )}
      </div>
      <FloatingButtonsBar config={config} />
      <TemplateDialog
        form={form}
        creator={creator}
        isOpenTemplateMenu={isOpenTemplateMenu}
        setIsOpenTemplateMenu={setIsOpenTemplateMenu}
      />
      <SaveSurveyDialog
        form={form}
        isOpenSaveSurveyDialog={isOpenSaveSurveyDialog}
        setIsOpenSaveSurveyDialog={setIsOpenSaveSurveyDialog}
        submitSurvey={handleSaveSurvey}
        isSubmitting={isLoading}
      />
      <QuestionsContextMenu
        form={form}
        creator={creator}
        isOpenQuestionContextMenu={isOpenQuestionContextMenu}
        setIsOpenQuestionContextMenu={setIsOpenQuestionContextMenu}
        isLoading={isUpdatingBackendLimiters}
      />
      <ExportSurveyToPdfDialog formula={creator.JSON as SurveyFormula} />
    </PageLayout>
  );
};

export default SurveyEditorPage;
