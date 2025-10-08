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
import { SurveyCreatorModel } from 'survey-creator-core';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import cn from '@libs/common/utils/className';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import ChoicesByUrl from '@/pages/Surveys/Editor/dialog/backend-limiter/ChoicesByUrl';
import Label from '@/components/ui/Label';
import Input from '@/components/shared/Input';
import RowAndColumnOptions from '@/pages/Surveys/Editor/dialog/matrix-options/RowAndColumnOptions';

interface QuestionsContextMenuBodyProps {
  form: UseFormReturn<SurveyDto>;
  creator: SurveyCreatorModel;
}

const QuestionsContextMenuBody = (props: QuestionsContextMenuBodyProps) => {
  const { form, creator } = props;

  const { selectedQuestion, questionTitle, setQuestionTitle, questionDescription, setQuestionDescription } =
    useQuestionsContextMenuStore();

  const { t } = useTranslation();

  if (!selectedQuestion) return null;

  return (
    <div className="flex flex-col gap-2">
      <Label>
        <p className="font-bold">{t('survey.editor.questionSettings.questionTitle')}</p>
      </Label>
      <Input
        placeholder={t('survey.editor.questionSettings.addQuestionTitle')}
        type="text"
        variant="dialog"
        value={questionTitle}
        onChange={(e) => setQuestionTitle(e.target.value)}
        className={cn(
          'mb-4',
          { 'text-muted-foreground': !questionTitle },
          { 'text-primary-foreground': questionTitle },
        )}
      />
      <Label>
        <p className="font-bold">{t('survey.editor.questionSettings.questionDescription')}</p>
      </Label>
      <Input
        placeholder={t('survey.editor.questionSettings.addQuestionDescription')}
        type="text"
        variant="dialog"
        value={questionDescription}
        onChange={(e) => setQuestionDescription(e.target.value)}
        className={cn(
          'mb-4',
          { 'text-muted-foreground': !questionDescription },
          { 'text-primary-foreground': questionDescription },
        )}
      />
      <RowAndColumnOptions />
      <ChoicesByUrl
        form={form}
        creator={creator}
      />
    </div>
  );
};

export default QuestionsContextMenuBody;
