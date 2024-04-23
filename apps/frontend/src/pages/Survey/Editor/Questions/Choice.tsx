import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';

interface ChoiceProps {
  choiceIndex: number;
  name: string;
  removeChoice: (id: number) => void;
}

const Choice = (props: ChoiceProps) => {
  const {
    choiceIndex,
    name,

    removeChoice,
  } = props;

  const { t } = useTranslation();

  const [isChecked, setIsChecked] = React.useState<boolean>(false);
  const [text, setText] = React.useState<string>('');

  return (
    <div>
      <div
        key={ `choice_${ name }_${ choiceIndex }` }
        className="inline-flex justify-between mt2 w-full pl-4 pr-4"
      >
        <input
          type="checkbox"
          checked={ isChecked }
          onChange={() => setIsChecked(!isChecked)}
        />
        <input
          className="text-gray-900 flex-grow ml-4 mr-4 border shadow-sm pl-2 pr-2"
          type="text"
          value={text}
          onChange={(e) =>
            setText(e.target.value)
          }
        />
        <Button
          className="h-10"
          variant="btn-organisation"
          onClick={() => removeChoice(choiceIndex)}
        >
          {t('survey.question.removeChoice')}
        </Button>
      </div>
    </div>
  )
};

export default Choice;
