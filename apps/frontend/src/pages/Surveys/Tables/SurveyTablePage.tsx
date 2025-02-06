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
import { ScrollArea } from '@/components/ui/ScrollArea';
import DeleteSurveysDialog from '@/pages/Surveys/Tables/dialogs/DeleteSurveysDialog';

interface SurveysTablePageProps {
  title: string;
  description: string;
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
    surveys,
    isLoading = false,

    canEdit = false,
    canDelete = false,
    canShowSubmittedAnswers = false,
    canParticipate = false,
    canShowResults = false,
  } = props;

  return (
    <>
      <div className="py-2">
        <p className="text-background">{title}</p>
        <p className="text-sm font-normal text-background">{description}</p>
      </div>
      <ScrollArea className="overflow-y-auto overflow-x-hidden scrollbar-thin">
        <SurveyTable
          columns={SurveyTableColumns}
          data={surveys || []}
          isLoading={isLoading}
        />
      </ScrollArea>
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
        </div>
      </TooltipProvider>
    </>
  );
};

export default SurveyTablePage;
