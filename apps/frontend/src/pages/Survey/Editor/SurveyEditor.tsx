import React from 'react';
// import { SurveyPage } from 'survey-react-ui';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/shared/Button';
import EditSurveyPage from '@/pages/Survey/Editor/EditSurveyPage.tsx';

const SurveyEditor = () => {
  const [pages, setPages] = React.useState<JSX.Element[]>([]);

  const { t } = useTranslation();

  const deletePage = (index: number) => {
    if (pages.length === 1) {
      setPages([])
      return;
    }

    console.log('removePageIndex', index);
    const newPages = pages.splice(index, 1);
    console.log('newPages', newPages);
    setPages(newPages);
  }

  const addPage = () => {
    const newPage = (
      <EditSurveyPage
        pageIndex={ `${ pages.length || '0' }` }
        pageName={ `${ t('survey.page.page') }_${ pages.length || '0' }` }
      />
    );
    console.log('newPage', newPage);

    if (pages.length === 0) {
      setPages([newPage]);
      return;
    }
    setPages([ ...pages, newPage]);
  }

  return (
    <div>
      <h1>{ `${ t('survey.editor.create') }` }</h1>

      <div
        className="mt-10"
      >
        { pages.map(
          (page, index) =>
            <div
              className="bg-gray-300 shadow border p-2 rounded mb-10"
              // eslint-disable-next-line react/no-array-index-key
              key={`survey_page_${index}`}
            >
              {page}
              <div className="flex justify-end">
                <Button
                  variant="btn-security"
                  onClick={() => deletePage(index)}
                >
                  {t('survey.page.remove')}
                </Button>
              </div>
            </div>
        )}
        <Button
          variant="btn-security"
          onClick={() => addPage()}
        >
          {`${t('survey.page.add')}`}
        </Button>
      </div>
    </div>
  )
};

export default SurveyEditor;
