import React from 'react';
import { Model } from 'survey-core';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Survey } from '@/pages/Survey/backend-copy/model';
import EditButton, { CELL_BUTTON_EDIT_WIDTH } from '@/pages/Survey/components/edit-dialog/EditButton';
import DeleteButton, { CELL_BUTTON_DELETE_WIDTH } from '@/pages/Survey/components/DeleteButton';
import ParticipateButton, {
  CELL_BUTTON_PARTICIPATE_WIDTH,
} from '@/pages/Survey/components/participation-dialog/ParticipateButton';
import ResultsButton, { CELL_BUTTON_ANSWER_WIDTH } from '@/pages/Survey/components/results-dialog/ResultsButton';
import useSurveyStore from '@/pages/Survey/SurveyStore';

interface SurveyTableProps {
  surveys: Survey[];
  showEditSurveyButton?: boolean;
  showDeleteSurveyButton?: boolean;
  showParticipateButton?: boolean;
  showLoadResultsButton?: boolean;
}

const SurveyTable = (props: SurveyTableProps) => {
  const {
    surveys,
    showParticipateButton = false,
    showEditSurveyButton = false,
    showDeleteSurveyButton = false,
    showLoadResultsButton = false,
  } = props;

  const { setSelectedSurvey } = useSurveyStore();

  return (
    <div className="w-50 m-4 flex-1 pl-3 pr-3.5">
      <ScrollArea className="max-h-[80vh] overflow-y-auto overflow-x-hidden">
        <Table>
          <TableHeader>
            <TableRow className="text-2xl text-white">
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Participant count</TableHead>
              <TableHead>Page count</TableHead>
              {showParticipateButton ? <TableHead className={`max-w-[${CELL_BUTTON_PARTICIPATE_WIDTH}]`} /> : null}
              {showLoadResultsButton ? <TableHead className={`max-w-[${CELL_BUTTON_ANSWER_WIDTH}]`} /> : null}
              {showEditSurveyButton ? <TableHead className={`max-w-[${CELL_BUTTON_EDIT_WIDTH}]`} /> : null}
              {showDeleteSurveyButton ? <TableHead className={`max-w-[${CELL_BUTTON_DELETE_WIDTH}]`} /> : null}
            </TableRow>
          </TableHeader>
          <TableBody className="container">
            {surveys.map((survey: Survey) => {
              const surv = JSON.parse(JSON.stringify(survey.survey)) as Model;
              return (
                <TableRow
                  key={`survey_row_-_${survey.surveyname}`}
                  className="cursor-pointer"
                  onClick={() => setSelectedSurvey(survey)}
                >
                  <TableCell className="text-white">{surv.title}</TableCell>
                  <TableCell className="text-white">{survey.type}</TableCell>
                  <TableCell className="text-white">{survey.participants.length || 0}</TableCell>
                  <TableCell className="text-white">{surv.pages.length || 0}</TableCell>
                  <TableCell className={`max-w-[${CELL_BUTTON_PARTICIPATE_WIDTH}]`}>
                    {showParticipateButton ? <ParticipateButton survey={survey} /> : null}
                  </TableCell>
                  <TableCell className={`max-w-[${CELL_BUTTON_ANSWER_WIDTH}]`}>
                    {showLoadResultsButton ? <ResultsButton survey={survey} /> : null}
                  </TableCell>
                  <TableCell className={`max-w-[${CELL_BUTTON_PARTICIPATE_WIDTH}]`}>
                    {showEditSurveyButton ? <EditButton survey={survey} /> : null}
                  </TableCell>
                  <TableCell className={`max-w-[${CELL_BUTTON_DELETE_WIDTH}]`}>
                    {showDeleteSurveyButton ? <DeleteButton surveyName={survey.surveyname} /> : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default SurveyTable;
