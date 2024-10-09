import React from 'react';
import { useTranslation } from 'react-i18next';
import { Question } from 'survey-core/typings/question';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import cn from '@/lib/utils';
import Switch from '@/components/ui/Switch';
import { Input as SHInput } from '@/components/ui/Input';

export const CHOOSE_OTHER_ITEM_CHOICE_NAME = 'showOtherItem';

interface ChoicesWithBackendLimitsShowOtherItemProps {
  selectedQuestion: Question;
  choices: ChoiceDto[];

  addChoice: (name: string, title?: string, limit?: number) => void;
  removeChoice: (name: string) => void;
  updateChoice: (name: string, choice: ChoiceDto) => void;
}

const ChoicesWithBackendLimitsShowOtherItem = (props: ChoicesWithBackendLimitsShowOtherItemProps) => {
  const { selectedQuestion, choices, addChoice, removeChoice, updateChoice } = props;

  const { t } = useTranslation();

  const showOtherItem = selectedQuestion.showOtherItem;
  const setShowOtherItem = (state: boolean) => {
    if (!state) {
      removeChoice(CHOOSE_OTHER_ITEM_CHOICE_NAME);
      selectedQuestion.showOtherItem = false;
    } else {
      addChoice(CHOOSE_OTHER_ITEM_CHOICE_NAME);
      selectedQuestion.showOtherItem = true;
    }
  }

  const otherItemsChoiceWithBackendLimit = choices.find((choice) => choice.name === CHOOSE_OTHER_ITEM_CHOICE_NAME)

  return (
    <div className="ml-2 flex-1 items-center text-foreground">
      <Switch
        checked={showOtherItem}
        onCheckedChange={setShowOtherItem}
        className={cn(
          {'text-gray-300': !showOtherItem},
          {'text-foreground': showOtherItem},
        )}
      />
      { showOtherItem
        ? (
          <SHInput
            type="number"
            placeholder={t('common.limit')}
            value={otherItemsChoiceWithBackendLimit?.limit || 0}
            onChange={(e) => otherItemsChoiceWithBackendLimit
              ? updateChoice(CHOOSE_OTHER_ITEM_CHOICE_NAME, { ...otherItemsChoiceWithBackendLimit, limit: Number(e.target.value) })
              : addChoice(CHOOSE_OTHER_ITEM_CHOICE_NAME, '', Number(e.target.value))
            }
            className="text-foreground"
          />
        )
        : null
      }
    </div>
  );
};

export default ChoicesWithBackendLimitsShowOtherItem;
