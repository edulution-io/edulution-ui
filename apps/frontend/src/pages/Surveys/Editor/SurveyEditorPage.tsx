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

import React, { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { faRotateLeft, faFilePdf, faBackward } from '@fortawesome/free-solid-svg-icons';
import { CalculatedValue } from 'survey-core';
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react';
import TSurveyQuestion from '@libs/survey/types/TSurveyQuestion';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import { CREATED_SURVEYS_PAGE, SURVEY_DEFAULT_LOGO_PATH } from '@libs/survey/constants/surveys-endpoint';
import getSurveyEditorFormSchema from '@libs/survey/types/editor/getSurveyEditorForm.schema';
import resetSurveyIdFromFormulasBackendLimiters from '@libs/survey/utils/resetSurveyIdFromFormulasBackendLimiters';
import { getAssetUrl } from '@libs/appconfig/utils/getAppAsset';
import APPS from '@libs/appconfig/constants/apps';
import ASSET_TYPES from '@libs/appconfig/constants/assetTypes';
import getSurveysDefaultValues from '@/pages/Surveys/utils/getSurveysDefaultValues';
import useThemeStore from '@/store/useThemeStore';
import useSurveysTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import useLdapGroups from '@/hooks/useLdapGroups';
import useLanguage from '@/hooks/useLanguage';
import useBeforeUnload from '@/hooks/useBeforeUnload';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import surveyTheme from '@/pages/Surveys/theme/surveyTheme';
import SaveSurveyDialog from '@/pages/Surveys/Editor/dialog/SaveSurveyDialog';
import createSurveyCreatorObject from '@/pages/Surveys/Editor/createSurveyCreatorObject';
import useSurveyTemplateStore from '@/pages/Surveys/Editor/dialog/useSurveyTemplateStore';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import SaveButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/saveButton';
import QuestionsContextMenu from '@/pages/Surveys/Editor/dialog/QuestionsContextMenu';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import useExportSurveyToPdfStore from '@/pages/Surveys/Participation/exportToPdf/useExportSurveyToPdfStore';
import ExportSurveyToPdfDialog from '@/pages/Surveys/Participation/exportToPdf/ExportSurveyToPdfDialog';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import '@/pages/Surveys/theme/creator.min.css';
import '@/pages/Surveys/theme/default2.min.css';

interface SurveyEditorPageProps {
  initialFormValues: SurveyDto;
}

const SurveyEditorPage = ({ initialFormValues }: SurveyEditorPageProps) => {
  const { isFetching, updateUsersSurveys } = useSurveysTablesPageStore();
  const {
    isOpenSaveSurveyDialog,
    setIsOpenSaveSurveyDialog,
    updateOrCreateSurvey,
    isLoading,
    reset: resetEditorPage,
    updateStoredSurvey,
    resetStoredSurvey,
    uploadFile,
  } = useSurveyEditorPageStore();
  const { reset: resetTemplateStore, template, uploadTemplate } = useSurveyTemplateStore();
  const {
    reset: resetQuestionsContextMenu,
    setIsOpenQuestionContextMenu,
    isOpenQuestionContextMenu,
    setSelectedQuestion,
    isUpdatingBackendLimiters,
  } = useQuestionsContextMenuStore();
  const { setIsOpen: setOpenExportPDFDialog } = useExportSurveyToPdfStore();

  const { t } = useTranslation();
  const { language } = useLanguage();
  const { isSuperAdmin } = useLdapGroups();
  const { theme, getResolvedTheme } = useThemeStore();

  const handleReset = () => {
    resetStoredSurvey();
    resetEditorPage();
    resetTemplateStore();
    resetQuestionsContextMenu();
  };

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

  useEffect(() => {
    if (!creator) return;
    creator.theme = surveyTheme;
    if (!creator.survey.logo) return;
    if (!creator.survey.logo?.startsWith(SURVEY_DEFAULT_LOGO_PATH)) return;
    creator.survey.logo = getAssetUrl(APPS.SURVEYS, ASSET_TYPES.logo, getResolvedTheme());
  }, [theme, getResolvedTheme, creator]);

  const resetSurveyEditorPage = useCallback(() => {
    handleReset();
    form.reset(initialFormValues);
    if (creator) {
      creator.saveNo = 0;
      creator.JSON = getSurveysDefaultValues(theme).formula;
    }
  }, [form, initialFormValues, creator]);

  const handleSaveTemplate = useCallback(async () => {
    if (!isSuperAdmin) {
      return;
    }
    const survey = form.getValues();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, formula, createdAt, saveNo, expires, answers, saveAsTemplate, ...remainingSurvey } = survey;
    const creationDate = template?.template.createdAt ?? new Date();
    const rawFormula = creator.JSON as SurveyFormula;
    const processedFormula: SurveyFormula = resetSurveyIdFromFormulasBackendLimiters(rawFormula, id);
    await uploadTemplate({
      id: template?.template.id,
      template: {
        formula: processedFormula,
        createdAt: creationDate,
        ...remainingSurvey,
      },
    });
    setIsOpenSaveSurveyDialog(false);
    resetSurveyEditorPage();
  }, [form, creator, template, uploadTemplate, isSuperAdmin, setIsOpenSaveSurveyDialog]);

  const handleNavigateToCreatedSurveys = () => {
    window.history.pushState(null, '', `/${CREATED_SURVEYS_PAGE}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleSaveSurvey = useCallback(async () => {
    if (!creator) return;

    if (creator.survey.logo?.startsWith(SURVEY_DEFAULT_LOGO_PATH)) {
      creator.survey.logo = `${SURVEY_DEFAULT_LOGO_PATH}/surveys-default-logo-{theme}.webp`;
      const newVariable = new CalculatedValue();
      newVariable.name = 'theme';
      newVariable.expression = getResolvedTheme().toString();
      newVariable.includeIntoResult = true;

      if (!creator.survey.calculatedValues) {
        creator.survey.calculatedValues = [];
      }

      creator.survey.setVariable('theme', getResolvedTheme().toString());
    }

    const formula = creator.JSON as SurveyFormula;
    const saveNo = creator.saveNo || 0;

    const survey = form.getValues();
    const { id, ...remainingSurvey } = survey;
    const isSavingFromTemplate = template?.id && id === template.id;

    const success = await updateOrCreateSurvey({
      ...remainingSurvey,
      formula,
      saveNo,
      id: isSavingFromTemplate ? undefined : id,
    });
    if (success) {
      void updateUsersSurveys();
      setIsOpenSaveSurveyDialog(false);

      resetStoredSurvey();

      toast.success(t('survey.editor.saveSurveySuccess'));
      handleNavigateToCreatedSurveys();
    }
  }, [creator, form, updateUsersSurveys, template]);

  const config: FloatingButtonsBarConfig = {
    buttons: [
      {
        icon: faRotateLeft,
        text: t('common.back'),
        onClick: () => resetSurveyEditorPage(),
      },
      SaveButton(() => setIsOpenSaveSurveyDialog(true)),
      {
        icon: faBackward,
        text: t('survey.editor.reset'),
        onClick: () => {
          form.reset(initialFormValues);
          if (creator) {
            creator.saveNo = initialFormValues.saveNo || 0;
            creator.JSON = initialFormValues.formula;
          }
        },
      },
      {
        icon: faFilePdf,
        text: t('survey.export.exportToPDF'),
        onClick: () => setOpenExportPDFDialog(true),
      },
    ],
    keyPrefix: 'surveys-page-floating-button_',
  };

  if (isLoading || isFetching) return <LoadingIndicatorDialog isOpen />;

  return (
    <>
      <div className="survey-editor h-full pt-1">
        {creator && (
          <SurveyCreatorComponent
            creator={creator}
            style={{
              height: '100%',
              width: '100%',
              ...surveyTheme.cssVariables,
            }}
          />
        )}
      </div>
      <FloatingButtonsBar config={config} />
      <SaveSurveyDialog
        form={form}
        isOpenSaveSurveyDialog={isOpenSaveSurveyDialog}
        setIsOpenSaveSurveyDialog={setIsOpenSaveSurveyDialog}
        submitSurvey={handleSaveSurvey}
        handleSaveTemplate={handleSaveTemplate}
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
    </>
  );
};

export default SurveyEditorPage;
