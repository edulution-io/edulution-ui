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
import YamlEditor from '@/components/shared/YamlEditor';
import { Button } from '@/components/shared/Button';

interface TemplateProps {
  form: UseFormReturn<SurveyDto>;
  creator: SurveyCreator;
  template: SurveyDto;
  key?: string;
}

const Template = (props: TemplateProps) => {
  const { form, creator, template, key } = props;
  const {
    formula,
    /* backendLimiter , */
    invitedAttendees,
    invitedGroups,
    isAnonymous,
    isPublic,
    canSubmitMultipleAnswers,
    canUpdateFormerAnswer,
  } = template;

  const { t } = useTranslation();

  const handleLoadTemplate = () => {
    // form.setValue('backendLimiter', backendLimiter);
    form.setValue('invitedAttendees', invitedAttendees);
    form.setValue('invitedGroups', invitedGroups);
    form.setValue('isAnonymous', isAnonymous);
    form.setValue('isPublic', isPublic);
    form.setValue('canSubmitMultipleAnswers', canSubmitMultipleAnswers);
    form.setValue('canUpdateFormerAnswer', canUpdateFormerAnswer);

    if (formula) {
      form.setValue('formula', formula);
      creator.JSON = formula;
    }
  };

  return (
    <div
      key={key}
      className="my-16"
    >
      {formula.title}
      <YamlEditor
        value={JSON.stringify(template, null, 2)}
        onChange={() => {}}
        disabled
        className="max-w-[calc(100% - 4rem)] max-h-[400px] min-h-[200px] w-full min-w-[400px]"
      />
      <Button
        className="my-0 h-[32px] py-0"
        onClick={handleLoadTemplate}
        variant="btn-outline"
      >
        {t('common.load')}
      </Button>
    </div>
  );
};

export default Template;
