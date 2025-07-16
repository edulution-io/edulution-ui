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
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import SurveyTemplateDto from '@libs/survey/types/api/surveyTemplate.dto';
import { Form } from '@/components/ui/Form';
import DialogSwitch from '@/components/shared/DialogSwitch';
import FormField from '@/components/shared/FormField';

interface TemplateDialogBodyProps {
  form: UseFormReturn<SurveyTemplateDto>;
}

const TemplateDialogBody = (props: TemplateDialogBodyProps) => {
  const { form } = props;

  const { t } = useTranslation();

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className="space-y-2">
          <FormField
            name="title"
            defaultValue={form.getValues('title')}
            form={form}
            labelTranslationId={t('survey.editor.templateMenu.templateTitle')}
            variant="dialog"
          />

          <FormField
            name="description"
            defaultValue={form.getValues('description')}
            form={form}
            labelTranslationId={t('survey.editor.templateMenu.templateDescription')}
            variant="dialog"
          />

          <DialogSwitch
            translationId="survey.editor.templateMenu.templateIsActive"
            checked={!!form.watch('isActive')}
            onCheckedChange={(isChecked) => {
              form.setValue('isActive', isChecked);
            }}
          />
        </div>
      </form>
    </Form>
  );
};

export default TemplateDialogBody;
