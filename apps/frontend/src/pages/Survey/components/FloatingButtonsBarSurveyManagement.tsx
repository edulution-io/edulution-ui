import React from 'react';
import { t } from 'i18next';
import { FiDelete, FiEdit } from 'react-icons/fi';
import { AiOutlineUpSquare, AiOutlineDownSquare, AiOutlinePlusSquare } from 'react-icons/ai';
import { TooltipProvider } from '@/components/ui/Tooltip';
import UserSurveyTypes from '@/pages/Survey/backend-copy/user-survey-search-types-enum.dto';
import useSurveyStore from '@/pages/Survey/SurveyStore';
import useEditSurveyDialogStore from '@/pages/Survey/components/edit-dialog/EditSurveyDialogStore';
// TODO: DELETE AFTER MERGING CLASS MANAGEMENT BRANCH AND UPDATE THE IMPORT
import FloatingActionButton from './FloatingActionButton';
import useParticipateSurveyDialogStore from '@/pages/Survey/components/participation-dialog/ParticipateSurveyDialogStore';
import useSurveyResultsDialogStore from '@/pages/Survey/components/results-dialog/SurveyResultsDialogStore';

const FloatingButtonsBarSurveyManagement = () => {
  const { selectedSurvey, selectedSurveyType } = useSurveyStore();
  const { setEditSurvey, openEditSurveyDialog } = useEditSurveyDialogStore();
  const { setParticipatingSurvey, openParticipateSurveyDialog } = useParticipateSurveyDialogStore();
  const { setResultingSurvey, getSurveyAnswer, openSurveyResultsDialog } = useSurveyResultsDialogStore();
  const { deleteSurvey, getOpenSurveys, getAnsweredSurveys } = useSurveyStore();

  const createButton = (
    <FloatingActionButton
      icon={AiOutlinePlusSquare}
      text={t('survey.create')}
      onClick={() => {
        setEditSurvey(undefined);
        openEditSurveyDialog();
      }}
    />
  );

  const editButton = (
    <FloatingActionButton
      icon={FiEdit}
      text={t('survey.edit')}
      onClick={() => {
        setEditSurvey(selectedSurvey);
        openEditSurveyDialog();
      }}
    />
  );
  const deleteButton = (
    <FloatingActionButton
      icon={FiDelete}
      text={t('survey.delete')}
      onClick={async () => {
        deleteSurvey(selectedSurvey?.surveyname);
        await getOpenSurveys();
        await getAnsweredSurveys();
      }}
    />
  );
  const participateButton = (
    <FloatingActionButton
      icon={AiOutlineUpSquare}
      text={t('survey.participate')}
      onClick={() => {
        setParticipatingSurvey(selectedSurvey);
        openParticipateSurveyDialog();
      }}
    />
  );
  const openResultsButton = (
    <FloatingActionButton
      icon={AiOutlineDownSquare}
      text={t('survey.result')}
      onClick={async () => {
        setResultingSurvey(selectedSurvey);
        await getSurveyAnswer(selectedSurvey?.surveyname);
        openSurveyResultsDialog();
      }}
    />
  );

  const selectedSurveyTypeButtons = () => {
    switch (selectedSurveyType) {
      case UserSurveyTypes.OPEN:
        return (
          <TooltipProvider>
            <div className="flex flex-row items-center space-x-8">{participateButton}</div>
          </TooltipProvider>
        );
      case UserSurveyTypes.ALL:
      case UserSurveyTypes.CREATED:
        return (
          <TooltipProvider>
            <div className="flex flex-row items-center space-x-8">
              {participateButton}
              {editButton}
              {deleteButton}
            </div>
          </TooltipProvider>
        );

      case UserSurveyTypes.ANSWERED:
        return (
          <TooltipProvider>
            <div className="flex flex-row items-center space-x-8">{openResultsButton}</div>
          </TooltipProvider>
        );
      default:
        return null;
    }
  };

  const typeButtons = selectedSurveyTypeButtons();

  return (
    <TooltipProvider>
      <div className="flex flex-row items-center space-x-8">
        {createButton}
        {typeButtons}
      </div>
    </TooltipProvider>
  );
};

export default FloatingButtonsBarSurveyManagement;
