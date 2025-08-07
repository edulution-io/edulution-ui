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
import cn from '@libs/common/utils/className';
import SHOW_OTHER_ITEM from '@libs/survey/constants/show-other-item';
import useQuestionsContextMenuStore from '@/pages/Surveys/Editor/dialog/useQuestionsContextMenuStore';
import Switch from '@/components/ui/Switch';
import Input from '@/components/shared/Input';
import Label from '@/components/ui/Label';

const ChoicesWithBackendLimitsShowOtherItem = () => {
  const {
    selectedQuestion,
    useBackendLimits,
    showOtherItem,
    toggleShowOtherItem,
    setChoiceLimit,
    currentChoices,
    addChoice,
  } = useQuestionsContextMenuStore();

  const { t } = useTranslation();

  const handleToggleShowOtherItem = () => {
    if (!selectedQuestion) return;

    selectedQuestion.showOtherItem = !showOtherItem;

    toggleShowOtherItem();
  };

  const otherItemsChoiceWithBackendLimit = currentChoices.find((choice) => choice.name === SHOW_OTHER_ITEM);

  return (
    <div className="ml-2 flex-1 items-center text-foreground">
      <div className="ml-2 inline-flex">
        <Switch
          checked={showOtherItem}
          onCheckedChange={handleToggleShowOtherItem}
          className={cn(
            { 'text-muted-foreground': !useBackendLimits },
            { 'text-primary-foreground': useBackendLimits },
          )}
        />
        <p className="ml-2 text-sm font-bold text-primary-foreground">
          {t('survey.editor.questionSettings.useOtherItem')}
        </p>
      </div>
      {showOtherItem ? (
        <>
          <p className="ml-4 mt-2 text-sm text-primary-foreground">
            {t('survey.editor.questionSettings.addBackendLimiterForOtherItem')}
          </p>
          <div className="ml-4 inline-flex items-center">
            <Label className="text-m flex-0 font-bold text-primary-foreground">
              {t('survey.editor.questionSettings.limit')}:
            </Label>
            <Input
              type="number"
              min="0"
              placeholder={t('common.limit')}
              value={otherItemsChoiceWithBackendLimit?.limit || 1}
              onChange={(e) =>
                otherItemsChoiceWithBackendLimit
                  ? setChoiceLimit(SHOW_OTHER_ITEM, Math.max(Number(e.target.value), 0))
                  : addChoice(SHOW_OTHER_ITEM, SHOW_OTHER_ITEM, Math.max(Number(e.target.value), 0))
              }
              variant="dialog"
              className="ml-2 mt-2 max-w-[80px] flex-1 text-primary-foreground"
            />
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ChoicesWithBackendLimitsShowOtherItem;
