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

import React, { useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { VscNewFile } from 'react-icons/vsc';
import { RiResetLeftLine } from 'react-icons/ri';
import { zodResolver } from '@hookform/resolvers/zod';
import useBeforeUnload from '@/hooks/useBeforeUnload';
import { useTranslation } from 'react-i18next';
import { TbTemplate } from 'react-icons/tb';
import { SurveyCreator, SurveyCreatorComponent } from 'survey-creator-react';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import AttendeeDto from '@libs/user/types/attendee.dto';
import SurveyFormula from '@libs/survey/types/TSurveyFormula';
import getInitialSurveyFormValues from '@libs/survey/constants/initial-survey-form';
import { CREATED_SURVEYS_PAGE } from '@libs/survey/constants/surveys-endpoint';
import getSurveyEditorFormSchema from '@libs/survey/types/editor/surveyEditorForm.schema';
import useUserStore from '@/store/UserStore/UserStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import useLanguage from '@/hooks/useLanguage';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import SaveSurveyDialog from '@/pages/Surveys/Editor/dialog/SaveSurveyDialog';
import createSurveyCreatorComponent from '@/pages/Surveys/Editor/createSurveyCreatorObject';
import TemplateDialog from '@/pages/Surveys/Editor/dialog/TemplateDialog';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import SaveButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/saveButton';
import PageLayout from '@/components/structure/layout/PageLayout';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';

const SurveyEditorPage = () => {
  const { fetchSelectedSurvey, isFetching, selectedSurvey, updateUsersSurveys } = useSurveyTablesPageStore();
  const {
    isOpenSaveSurveyDialog,
    setIsOpenSaveSurveyDialog,
    updateOrCreateSurvey,
    isLoading,
    reset: resetEditorPage,
    storedSurvey,
    updateStoredSurvey,
    resetStoredSurvey,
    uploadImageFile,
  } = useSurveyEditorPageStore();
  const { reset: resetTemplateStore, isOpenTemplateMenu, setIsOpenTemplateMenu } = useTemplateMenuStore();

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { surveyId } = useParams();
  const { language } = useLanguage();

  const handleReset = () => {
    resetEditorPage();
    resetTemplateStore();
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
  }, [selectedSurvey]);

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
    creatorRef.current = createSurveyCreatorComponent(language);
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
    if (creator) {
      creator.saveNo = form.getValues('saveNo');
      creator.JSON = form.getValues('formula');
      creator.locale = language;
      creator.saveSurveyFunc = updateSurveyStorage;

      creator.onUploadFile.add(async (_, options) => {
        // TODO: 630 (https://github.com/edulution-io/edulution-ui/issues/630) -  Currently this can only work for already created surveys
        if (!surveyId) return;
        const promises = options.files.map((file: File) => {
          if (!options.question?.id) {
            return uploadImageFile(surveyId, 'Header', file, options.callback);
          }
          return uploadImageFile(surveyId, options.question.id, file, options.callback);
        });
        await Promise.all(promises);
      });
    }
  }, [creator, form, language]);

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
      navigate(`/${CREATED_SURVEYS_PAGE}`);
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
          resetStoredSurvey();
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
          resetStoredSurvey();
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
    </PageLayout>
  );
};

export default SurveyEditorPage;
