/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
  hiddenColumns?: string[];
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
    hiddenColumns = [],
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
        hiddenColumns={hiddenColumns}
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
