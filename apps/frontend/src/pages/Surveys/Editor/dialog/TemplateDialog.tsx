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

import React from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SurveyCreator } from 'survey-creator-react';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyTemplateDto from '@libs/survey/types/api/surveyTemplate.dto';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import getSurveyTemplateFormSchema from '@libs/survey/types/editor/getSurveyTemplateForm.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import useLdapGroups from '@/hooks/useLdapGroups';
import TemplateDialogBody from '@/pages/Surveys/Editor/dialog/TemplateDialogBody';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

interface TemplateDialogProps {
  editorForm: UseFormReturn<SurveyDto>;
  surveyCreatorModel: SurveyCreator;

  isOpenSaveTemplateMenu: boolean;
  setIsOpenSaveTemplateMenu: (state: boolean) => void;

  trigger?: React.ReactNode;
}

const TemplateDialog = (props: TemplateDialogProps) => {
  const { trigger, surveyCreatorModel, editorForm, isOpenSaveTemplateMenu, setIsOpenSaveTemplateMenu } = props;

  const { template, uploadTemplate } = useTemplateMenuStore();

  const { t } = useTranslation();
  const { isSuperAdmin } = useLdapGroups();

  const initialFormValues = {
    fileName: template?.fileName || undefined,
    title: template?.title || undefined,
    description: template?.description || undefined,
    disabled: template?.disabled ?? true,
    createdAt: template?.createdAt || new Date(),
    updatedAt: new Date(),
  };

  const templateForm = useForm<SurveyTemplateDto>({
    mode: 'onChange',
    resolver: zodResolver(getSurveyTemplateFormSchema()),
    defaultValues: initialFormValues,
  });

  const handleClose = () => {
    templateForm.reset(initialFormValues);
    setIsOpenSaveTemplateMenu(!isOpenSaveTemplateMenu);
  };

  const handleSaveTemplate = async () => {
    const survey = editorForm.getValues();

    const surveyTemplateDto = templateForm.getValues();
    surveyTemplateDto.template = {
      formula: (surveyCreatorModel.JSON as SurveyFormula) || (surveyCreatorModel.survey.toJSON() as SurveyFormula),
      invitedAttendees: survey.invitedAttendees,
      invitedGroups: survey.invitedGroups,
      isPublic: survey.isPublic,
      isAnonymous: survey.isAnonymous,
      canSubmitMultipleAnswers: survey.canSubmitMultipleAnswers,
      canUpdateFormerAnswer: survey.canUpdateFormerAnswer,
    };
    surveyTemplateDto.backendLimiters = survey?.backendLimiters;

    await uploadTemplate(surveyTemplateDto);
    setIsOpenSaveTemplateMenu(false);
  };

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <AdaptiveDialog
      isOpen={isOpenSaveTemplateMenu}
      trigger={trigger}
      handleOpenChange={handleClose}
      title={t('survey.editor.templateMenu.title')}
      body={<TemplateDialogBody form={templateForm} />}
      footer={
        <DialogFooterButtons
          handleClose={handleClose}
          handleSubmit={handleSaveTemplate}
        />
      }
      desktopContentClassName="max-w-[50%] min-h-[200px] max-h-[90%] overflow-auto"
    />
  );
};

export default TemplateDialog;
