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

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AiOutlineUpSquare } from 'react-icons/ai';
import { HiOutlineArrowDownOnSquare, HiOutlineArrowDownOnSquareStack } from 'react-icons/hi2';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import { EDIT_SURVEY_PAGE, PARTICIPATE_SURVEY_PAGE } from '@libs/survey/constants/surveys-endpoint';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/useResultDialogStore';
import useSubmittedAnswersDialogStore from '@/pages/Surveys/Tables/dialogs/useSubmittedAnswersDialogStore';
import { TooltipProvider } from '@/components/ui/Tooltip';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import EditButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/editButton';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import useUserStore from '@/store/UserStore/useUserStore';
import useDeleteSurveyStore from '../dialogs/useDeleteSurveyStore';

interface SurveysTablesFloatingButtonsProps {
  canEdit: boolean;
  canDelete: boolean;
  canParticipate: boolean;
  canShowSubmittedAnswers: boolean;
  canShowResults: boolean;
}

const SurveysTablesFloatingButtons = (props: SurveysTablesFloatingButtonsProps) => {
  const {
    canEdit = false,
    canDelete = false,
    canShowSubmittedAnswers = false,
    canParticipate = false,
    canShowResults = false,
  } = props;
  const {
    selectedSurvey,
    selectSurvey,
    updateUsersSurveys,
    selectedRows,
    hasAnswers,
    canParticipateSelectedSurvey,
    hasAnswersSelectedSurvey,
    answeredSurveys,
    openSurveys,
    createdSurveys,
  } = useSurveyTablesPageStore();
  const { user } = useUserStore();
  const { setIsOpenPublicResultsTableDialog, setIsOpenPublicResultsVisualisationDialog } = useResultDialogStore();
  const { setIsOpenSubmittedAnswersDialog } = useSubmittedAnswersDialogStore();
  const { setIsDeleteSurveysDialogOpen } = useDeleteSurveyStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const selectedSurveysIds = Object.keys(selectedRows);
  const selectedSurveysCount = selectedSurveysIds.length;

  useEffect(() => {
    const survey = [...answeredSurveys, ...openSurveys, ...createdSurveys].find((s) => s.id === selectedSurveysIds[0]);
    selectSurvey(survey);
    void canParticipateSelectedSurvey(survey?.id);
    void hasAnswersSelectedSurvey(survey?.id);
  }, [selectedRows]);

  if (!selectedSurveysCount) {
    return null;
  }

  const handleDeleteSurvey = () => {
    if (Object.keys(selectedRows).length > 0) {
      void setIsDeleteSurveysDialogOpen(true);
      void updateUsersSurveys();
    }
  };

  const isOnlyOneSurveySelected = selectedSurveysCount === 1;

  const shouldShowResults = isOnlyOneSurveySelected && canShowResults && hasAnswers;
  const hasCurrentUserAnsweredSurvey = selectedSurvey?.participatedAttendees.some((a) => a.username === user?.username);

  const config: FloatingButtonsBarConfig = {
    buttons: [
      EditButton(() => {
        navigate(`/${EDIT_SURVEY_PAGE}/${selectedSurvey?.id}`);
      }, isOnlyOneSurveySelected && canEdit),

      DeleteButton(handleDeleteSurvey, canDelete),
      {
        icon: HiOutlineArrowDownOnSquare,
        text: t('surveys.actions.showSubmittedAnswers'),
        onClick: () => setIsOpenSubmittedAnswersDialog(true),
        isVisible: isOnlyOneSurveySelected && canShowSubmittedAnswers && hasCurrentUserAnsweredSurvey,
      },
      {
        icon: HiOutlineArrowDownOnSquareStack,
        text: t('surveys.actions.showResultsTable'),
        onClick: () => setIsOpenPublicResultsTableDialog(true),
        isVisible: shouldShowResults,
      },
      {
        icon: HiOutlineArrowDownOnSquareStack,
        text: t('surveys.actions.showResultsChart'),
        onClick: () => setIsOpenPublicResultsVisualisationDialog(true),
        isVisible: shouldShowResults,
      },
      {
        icon: AiOutlineUpSquare,
        text: t('common.participate'),
        onClick: () => {
          navigate(`/${PARTICIPATE_SURVEY_PAGE}/${selectedSurvey?.id}`);
        },
        isVisible: isOnlyOneSurveySelected && canParticipate,
      },
    ],
    keyPrefix: 'surveys-page-floating-button_',
  };

  return (
    <TooltipProvider>
      <FloatingButtonsBar config={config} />
    </TooltipProvider>
  );
};

export default SurveysTablesFloatingButtons;
