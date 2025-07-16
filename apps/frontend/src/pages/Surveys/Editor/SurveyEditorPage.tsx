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

import React, { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { VscNewFile } from 'react-icons/vsc';
import { RiResetLeftLine } from 'react-icons/ri';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { TbTemplate } from 'react-icons/tb';
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react';
import TSurveyQuestion from '@libs/survey/types/TSurveyQuestion';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyFormula from '@libs/survey/types/TSurveyFormula';
import { CREATED_SURVEYS_PAGE } from '@libs/survey/constants/surveys-endpoint';
import getSurveyEditorFormSchema from '@libs/survey/types/editor/surveyEditorForm.schema';
import useSurveysTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import useLdapGroups from '@/hooks/useLdapGroups';
import useLanguage from '@/hooks/useLanguage';
import useBeforeUnload from '@/hooks/useBeforeUnload';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import SaveSurveyDialog from '@/pages/Surveys/Editor/dialog/SaveSurveyDialog';
import createSurveyCreatorObject from '@/pages/Surveys/Editor/createSurveyCreatorObject';
import TemplateDialog from '@/pages/Surveys/Editor/dialog/TemplateDialog';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import SaveButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/saveButton';
import QuestionContextMenu from '@/pages/Surveys/Editor/dialog/QuestionsContextMenu';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';

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
  const { reset: resetTemplateStore, isOpenSaveTemplateMenu, setIsOpenSaveTemplateMenu } = useTemplateMenuStore();
  const {
    reset: resetQuestionsContextMenu,
    setIsOpenQuestionContextMenu,
    isOpenQuestionContextMenu,
    setSelectedQuestion,
    isUpdatingBackendLimiters,
  } = useQuestionsContextMenuStore();

  const { t } = useTranslation();
  const { language } = useLanguage();
  const { isSuperAdmin } = useLdapGroups();

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
        onClick: () => setIsOpenSaveTemplateMenu(!isOpenSaveTemplateMenu),
        isVisible: !!isSuperAdmin,
      },
      {
        icon: VscNewFile,
        text: t('survey.editor.new'),
        onClick: () => {
          handleReset();
          form.reset(initialFormValues);
          if (creator) {
            creator.saveNo = 0;
            creator.JSON = { title: t('survey.newTitle').toString() };
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
    ],
    keyPrefix: 'surveys-page-floating-button_',
  };

  if (isLoading || isFetching) return <LoadingIndicatorDialog isOpen />;

  return (
    <>
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
        editorForm={form}
        surveyCreatorModel={creator}
        isOpenSaveTemplateMenu={isOpenSaveTemplateMenu}
        setIsOpenSaveTemplateMenu={setIsOpenSaveTemplateMenu}
      />
      <SaveSurveyDialog
        form={form}
        isOpenSaveSurveyDialog={isOpenSaveSurveyDialog}
        setIsOpenSaveSurveyDialog={setIsOpenSaveSurveyDialog}
        submitSurvey={handleSaveSurvey}
        isSubmitting={isLoading}
      />
      <QuestionContextMenu
        form={form}
        creator={creator}
        isOpenQuestionContextMenu={isOpenQuestionContextMenu}
        setIsOpenQuestionContextMenu={setIsOpenQuestionContextMenu}
        isLoading={isUpdatingBackendLimiters}
      />
    </>
  );
};

export default SurveyEditorPage;
