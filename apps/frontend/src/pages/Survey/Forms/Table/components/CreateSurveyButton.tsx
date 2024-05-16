import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';

const CreateSurveyButton = () => {
  const { t } = useTranslation();
  return (
    <>
      <Link
        to="/survey/forms/create"
        className="m-2"
      >
        <Button variant="btn-collaboration">
          <p>{t('survey.forms.editor.create')}</p>
        </Button>
      </Link>

      {/* <Link */}
      {/*   to="/survey/poll/create" */}
      {/*   className="m-2" */}
      {/* > */}
      {/*   <Button variant="btn-collaboration"> */}
      {/*     <p>{t('survey.poll.add')}</p> */}
      {/*   </Button> */}
      {/* </Link> */}
    </>
  );
};

export default CreateSurveyButton;
