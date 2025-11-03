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
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SurveyCreator } from 'survey-creator-react';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import TSurveyElement from '@libs/survey/types/TSurveyElement';
import TEMPORAL_SURVEY_ID_STRING from '@libs/survey/constants/temporal-survey-id-string';
import useLdapGroups from '@/hooks/useLdapGroups';
import TemplateDialogBody from '@/pages/Surveys/Editor/dialog/TemplateDialogBody';
import useTemplateMenuStore from '@/pages/Surveys/Editor/dialog/useTemplateMenuStore';
import DeleteTemplateDialog from '@/pages/Surveys/Editor/dialog/DeleteTemplateDialog';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

interface TemplateDialogProps {
  form: UseFormReturn<SurveyDto>;
  creator: SurveyCreator;

  isOpenTemplateMenu: boolean;
  setIsOpenTemplateMenu: (state: boolean) => void;

  trigger?: React.ReactNode;
}

const TemplateDialog = (props: TemplateDialogProps) => {
  const { trigger, form, creator, isOpenTemplateMenu, setIsOpenTemplateMenu } = props;

  const { template, uploadTemplate, isOpenTemplateConfirmDeletion, setIsOpenTemplateConfirmDeletion } =
    useTemplateMenuStore();

  const { isSuperAdmin } = useLdapGroups();

  const { t } = useTranslation();

  const updateLinkForRestfulChoices = (elements: TSurveyElement[] | undefined, surveyId: string) =>
    (elements || []).map((el) => {
      if (el.choicesByUrl && el.choicesByUrl.url.includes(surveyId)) {
        return {
          ...el,
          choicesByUrl: {
            ...el.choicesByUrl,
            url: el.choicesByUrl.url.replace(`/${surveyId}/`, `/${TEMPORAL_SURVEY_ID_STRING}/`),
          },
        };
      }
      return el;
    });

  const handleSaveTemplate = async () => {
    const values = form.getValues();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, formula, createdAt, saveNo, expires, answers, ...remainingSurvey } = values;
    const creationDate = template?.template.createdAt || new Date();
    const processingFormula = { ...(creator.JSON as SurveyFormula) };

    let processedFormula: SurveyFormula | undefined;
    if (id) {
      if (processingFormula.pages && processingFormula.pages.length > 0) {
        const updatedPages = processingFormula.pages.map((page) => ({
          ...page,
          elements: updateLinkForRestfulChoices(page.elements, id),
        }));
        processedFormula = { ...processingFormula, pages: updatedPages };
      } else if (processingFormula.elements && processingFormula.elements.length > 0) {
        const updatedElements = updateLinkForRestfulChoices(processingFormula.elements, id);
        processedFormula = { ...processingFormula, elements: updatedElements };
      }
    }

    await uploadTemplate({
      fileName: template?.fileName,
      template: { formula: processedFormula || processingFormula, createdAt: creationDate, ...remainingSurvey },
    });
    setIsOpenTemplateMenu(false);
  };

  const getDialogBody = () => (
    <>
      <TemplateDialogBody
        form={form}
        surveyCreator={creator}
      />
      <DeleteTemplateDialog
        isOpenTemplateConfirmDeletion={isOpenTemplateConfirmDeletion}
        setIsOpenTemplateConfirmDeletion={setIsOpenTemplateConfirmDeletion}
      />
    </>
  );

  const handleClose = () => setIsOpenTemplateMenu(!isOpenTemplateMenu);

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
      isOpen={isOpenTemplateMenu}
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
