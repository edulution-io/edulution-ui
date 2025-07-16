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
import { useForm, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import useLdapGroups from '@/hooks/useLdapGroups';
import TemplateDialogBody from '@/pages/Surveys/Editor/dialog/TemplateDialogBody';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import SurveyTemplateDto from '@libs/survey/types/api/surveyTemplate.dto';
import { zodResolver } from '@hookform/resolvers/zod';
import getSurveyTemplateFormSchema from '@libs/survey/types/editor/surveyTemplateForm.schema';
import getInitialTemplateFormBySurvey from '@libs/survey/constants/get-initial-template-form-by-survey';
// import DeleteTemplateDialog from '@/pages/Surveys/Editor/dialog/DeleteTemplateDialog';

interface TemplateDialogProps {
  editorForm: UseFormReturn<SurveyDto>;

  isOpenSaveTemplateMenu: boolean;
  setIsOpenSaveTemplateMenu: (state: boolean) => void;

  trigger?: React.ReactNode;
}

const TemplateDialog = (props: TemplateDialogProps) => {
  const { trigger, editorForm, isOpenSaveTemplateMenu, setIsOpenSaveTemplateMenu } = props;

  const { uploadTemplate } = useTemplateMenuStore();

  const { isSuperAdmin } = useLdapGroups();

  const { t } = useTranslation();

  const initialFormValues: SurveyTemplateDto = useMemo(() => getInitialTemplateFormBySurvey(editorForm.getValues()), [editorForm]);

  const templateForm = useForm<SurveyTemplateDto>({
    mode: 'onChange',
    resolver: zodResolver(getSurveyTemplateFormSchema()),
    defaultValues: initialFormValues,
  });

  useEffect(() => {
    templateForm.reset(initialFormValues);
  }, [initialFormValues]);

  const getDialogBody = () => (
    <>
      <TemplateDialogBody
        form={templateForm}
      />
      {/*
        // TODO: This moves to the `SurveyEditorLoadingPage` PR: 1065
        <DeleteTemplateDialog
          isOpenTemplateConfirmDeletion={isOpenTemplateConfirmDeletion}
          setIsOpenTemplateConfirmDeletion={setIsOpenTemplateConfirmDeletion}
        />
       */}
    </>
  );

  const handleClose = () => setIsOpenSaveTemplateMenu(!isOpenSaveTemplateMenu);

  const handleSaveTemplate = async () => {
    const template = templateForm.getValues();
    await uploadTemplate(template);
    setIsOpenSaveTemplateMenu(false);
  };

  const getFooter = () => {
    if (isSuperAdmin) {
      return (
        <DialogFooterButtons
          handleClose={handleClose}
          handleSubmit={handleSaveTemplate}
        />
      );
    }
    return <DialogFooterButtons handleClose={handleClose} />;
  };

  return (
    <AdaptiveDialog
      isOpen={isOpenSaveTemplateMenu}
      trigger={trigger}
      handleOpenChange={handleClose}
      title={t('survey.editor.templateMenu.title')}
      body={getDialogBody()}
      footer={getFooter()}
      desktopContentClassName="max-w-[50%] min-h-[200px] max-h-[90%] overflow-auto"
    />
  );
};

export default TemplateDialog;
