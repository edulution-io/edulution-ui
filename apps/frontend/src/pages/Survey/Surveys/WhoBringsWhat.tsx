import React from 'react';
import { useTranslation } from "react-i18next";
import { Button } from '@/components/shared/Button';
import {
  CLASS_NAME_SURVEY_INPUT,
  CLASS_NAME_SURVEY_LABEL,
  CLASS_NAME_SURVEY_SECTION
} from "@/pages/Survey/Editor/Questions/Question.tsx";
import ItemAssignment from "@/pages/Survey/Surveys/ItemAssignment.tsx";

const WhoBringsWhat = () => {

  const { t } = useTranslation();

  const [items, setItems] = React.useState<JSX.Element[]>([]);

  const removeItem = (index: number) => {

    console.log('items', items);
    console.log('index', index);

    if (items.length === 1) {
      setItems([])
      return;
    }
    const newItems = items.splice(index, 1);

    console.log('newItems', newItems);

    setItems(newItems);
  }

  const addItem = () => {
    const newChoice = (
      <ItemAssignment
        key={`item_item_${ items.length || 0 }`}
        index={ items.length || 0 }
        name={`item_${ items.length || 0 }`}
        assignee={ 'Alice' }
      />
    );
    setItems([...items, newChoice])
  }

  return (
    <div>
      <h1>{ 'WHO-BRINGS-WHAT' }</h1>

      <div
        className="bg-gray-100 shadow p-4 mt-10"
      >
        <div>
          <div
            className={CLASS_NAME_SURVEY_SECTION}
          >
            <div
              className={CLASS_NAME_SURVEY_LABEL}
            >
              <h4>
                {'What do we need? Who could bring it?'}
              </h4>
            </div>
          </div>

          <div
            className={CLASS_NAME_SURVEY_SECTION}
          >
            <div
              className={CLASS_NAME_SURVEY_LABEL}
            >
              <label>
                {t('survey.question.choices')}
              </label>
            </div>

            { items.map((item, index) => (
              <div>
                { item }
                <Button
                  key={`item_button_${ index }`}
                  variant="btn-security"
                  onClick={() => removeItem(index)}
                >
                  {t('survey.question.remove')}
                </Button>
              </div>
            ))}

            <Button
              variant="btn-collaboration"
              onClick={() => addItem()}
            >
              {`${t('survey.question.addChoice')}`}
            </Button>
          </div>

          <div
            className={CLASS_NAME_SURVEY_SECTION}
          >
            <div
              className={CLASS_NAME_SURVEY_LABEL}
            >
              <label>
                {'Description'}
              </label>
            </div>
            <input
              className={CLASS_NAME_SURVEY_INPUT}
              type="text"
              value={'Use this form to create a list of items that may be needed.' +
                'And to assign a person to each item who is responsible for that item'}
              readOnly
            />
          </div>

        </div>
      </div>
    </div>
  )
};

export default WhoBringsWhat;
