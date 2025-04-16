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
// import { UseFormReturn } from 'react-hook-form';
// import SurveyDto from '@libs/survey/types/api/survey.dto';
import cn from '@libs/common/utils/className';
import { Input } from '@/components/ui/Input';
import useQuestionSettingsDialogStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';

// interface QuestionContextMenuBodyProps {
//   form: UseFormReturn<SurveyDto>;
// }

const QuestionContextMenuBody = () => {
  // { form }: QuestionContextMenuBodyProps) => {

  const { selectedQuestion, questionTitle, setQuestionTitle, questionDescription, setQuestionDescription } =
    useQuestionSettingsDialogStore();

  const { t } = useTranslation();

  if (!selectedQuestion) return null;

  return (
    <>
      <p className="text-m font-bold text-foreground">{t('survey.editor.questionSettings.questionTitle')}</p>
      <div className="ml-2 flex-1 items-center text-foreground">
        <Input
          type="text"
          value={questionTitle}
          onChange={(e) => setQuestionTitle(e.target.value)}
          className={cn({ 'text-gray-300': !questionTitle }, { 'text-foreground': questionTitle })}
        />
      </div>

      <p className="text-m font-bold text-foreground">{t('survey.editor.questionSettings.questionDescription')}</p>
      <div className="ml-2 flex-1 items-center text-foreground">
        <Input
          type="text"
          placeholder={t('survey.editor.questionSettings.addQuestionDescription')}
          value={questionDescription}
          onChange={(e) => setQuestionDescription(e.target.value)}
          className={cn({ 'text-gray-300': !questionDescription }, { 'text-foreground': questionDescription })}
        />
      </div>
    </>
  );
};

export default QuestionContextMenuBody;
