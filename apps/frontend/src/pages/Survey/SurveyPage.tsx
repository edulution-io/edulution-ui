import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import SurveyTable from '@/pages/Survey/SurveyTable';

const SurveyPage = () => {
  const { t } = useTranslation();

  const sectionClassName = 'mb-4';
  const contentClassName = 'p-2';
  const optionClassName = 'p-2';

  return (
    <div>
      <div className={sectionClassName}>
        <h4>{t('survey.poll.title')}</h4>

        <div className={contentClassName}>
          {t('survey.poll.poll')}

          <div className={optionClassName}>
            {t('survey.poll.add')}
            <NavLink to="/survey/poll/create">
              <Button variant="btn-collaboration">
                <p>{t('survey.poll.add')}</p>
              </Button>
            </NavLink>
          </div>
        </div>
      </div>

      <div className={sectionClassName}>
        <h4>{t('survey.forms.title')}</h4>

        <div className={contentClassName}>
          {t('survey.forms.forms')}

          <div className={optionClassName}>
            {t('survey.forms.editor.create')}
            <NavLink to="/survey/forms/create">
              <Button variant="btn-collaboration">
                <p>{t('survey.forms.editor.title')}</p>
              </Button>
            </NavLink>
          </div>
        </div>
      </div>

      <div className={sectionClassName}>
        <div className={contentClassName}>
          <div className={optionClassName}>
            <SurveyTable />
          </div>
          <div className={optionClassName}>
            {t('survey.forms.load')}
            <NavLink to="/survey/quizzes/create">
              <Button variant="btn-collaboration">
                <p>{t('survey.quizzes.load')}</p>
              </Button>
            </NavLink>
          </div>
          <div className={optionClassName}>
            {t('survey.forms.load')}
            <NavLink to="/survey/forms/create">
              <Button variant="btn-collaboration">
                <p>{t('survey.forms.load')}</p>
              </Button>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyPage;
