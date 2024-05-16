import React from 'react';
import { Model } from 'survey-core';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Survey } from '@/pages/Survey/backend-copy/model';
import CellButtonEdit, { CELL_BUTTON_EDIT_WIDTH } from '@/pages/Survey/Forms/Table/components/CellButtonEdit';
import CellButtonDelete, { CELL_BUTTON_DELETE_WIDTH } from '@/pages/Survey/Forms/Table/components/CellButtonDelete';
import CellButtonParticipate, {
  CELL_BUTTON_PARTICIPATE_WIDTH,
} from '@/pages/Survey/Forms/Table/components/CellButtonParticipate';

interface SurveyTableProps {
  surveys: Survey[];
  setSelectedSurvey: (survey: Survey) => void;
  deleteSurvey?: (surveyname: string) => void;

  showOpenButton?: boolean;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
}

const SurveyTable = (props: SurveyTableProps) => {
  const {
    surveys,
    setSelectedSurvey,
    deleteSurvey = () => {},
    showOpenButton = false,
    showEditButton = false,
    showDeleteButton = false,
  } = props;

  if (!surveys || surveys.length === 0) {
    return null;
  }

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
              {showOpenButton ? <TableHead className={`max-w-[${CELL_BUTTON_PARTICIPATE_WIDTH}]`} /> : null}
              {showDeleteButton ? <TableHead className={`max-w-[${CELL_BUTTON_DELETE_WIDTH}]`} /> : null}
              {showEditButton ? <TableHead className={`max-w-[${CELL_BUTTON_EDIT_WIDTH}]`} /> : null}
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
                  {showOpenButton ? <CellButtonParticipate survey={survey} /> : null}
                  {showDeleteButton ? (
                    <CellButtonDelete
                      surveyName={survey.surveyname}
                      deleteSurvey={deleteSurvey}
                    />
                  ) : null}
                  {showEditButton ? <CellButtonEdit survey={survey} /> : null}
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
