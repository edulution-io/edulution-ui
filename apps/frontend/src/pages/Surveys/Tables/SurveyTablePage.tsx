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
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyTable from '@/pages/Surveys/Tables/components/SurveyTable';
import SurveyTableColumns from '@/pages/Surveys/Tables/components/SurveyTableColumns';
import SurveysTablesFloatingButtons from '@/pages/Surveys/Tables/components/SurveysTablesFloatingButtons';
import ResultTableDialog from '@/pages/Surveys/Tables/dialogs/ResultTableDialog';
import ResultVisualizationDialog from '@/pages/Surveys/Tables/dialogs/ResultVisualizationDialog';
import SubmittedAnswersDialog from '@/pages/Surveys/Tables/dialogs/SubmittedAnswersDialog';
import { TooltipProvider } from '@/components/ui/Tooltip';
import DeleteSurveysDialog from '@/pages/Surveys/Tables/dialogs/DeleteSurveysDialog';
import SharePublicQRDialog from '@/components/shared/SharePublicQRDialog';
import useSurveyEditorPageStore from '@/pages/Surveys/Editor/useSurveyEditorPageStore';
import { PUBLIC_SURVEYS } from '@libs/survey/constants/surveys-endpoint';
import PageLayout from '@/components/structure/layout/PageLayout';
import EDU_BASE_URL from '@libs/common/constants/eduApiBaseUrl';

interface SurveysTablePageProps {
  title: string;
  description: string;
  icon: string;
  surveys?: SurveyDto[];
  isLoading?: boolean;

  canEdit?: boolean;
  canDelete?: boolean;
  canShowSubmittedAnswers?: boolean;
  canParticipate?: boolean;
  canShowResults?: boolean;
}

const SurveyTablePage = (props: SurveysTablePageProps) => {
  const {
    title,
    description,
    icon,
    surveys,
    isLoading = false,

    canEdit = false,
    canDelete = false,
    canShowSubmittedAnswers = false,
    canParticipate = false,
    canShowResults = false,
  } = props;
  const { isOpenSharePublicSurveyDialog, closeSharePublicSurveyDialog, publicSurveyId } = useSurveyEditorPageStore();
  const sharePublicSurveyUrl = publicSurveyId ? `${EDU_BASE_URL}/${PUBLIC_SURVEYS}/${publicSurveyId}` : '';

  return (
    <PageLayout
      nativeAppHeader={{
        title,
        description,
        iconSrc: icon,
      }}
    >
      <SurveyTable
        columns={SurveyTableColumns}
        data={surveys || []}
        isLoading={isLoading}
      />

      <SurveysTablesFloatingButtons
        canEdit={canEdit}
        canDelete={canDelete}
        canShowSubmittedAnswers={canShowSubmittedAnswers}
        canParticipate={canParticipate}
        canShowResults={canShowResults}
      />

      <TooltipProvider>
        <div className="absolute bottom-8 flex flex-row items-center space-x-8 bg-opacity-90">
          <DeleteSurveysDialog surveys={surveys || []} />
          <ResultTableDialog />
          <ResultVisualizationDialog />
          <SubmittedAnswersDialog />
          <SharePublicQRDialog
            url={sharePublicSurveyUrl}
            isOpen={isOpenSharePublicSurveyDialog && !!sharePublicSurveyUrl}
            handleClose={() => closeSharePublicSurveyDialog()}
            titleTranslationId="surveys.sharePublicSurveyDialog.title"
            descriptionTranslationId="surveys.sharePublicSurveyDialog.description"
          />
        </div>
      </TooltipProvider>
    </PageLayout>
  );
};

export default SurveyTablePage;
