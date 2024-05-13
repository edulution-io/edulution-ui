import React, { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useSurveyStore from '@/pages/Survey/SurveyStore';
import { Survey } from '@/pages/Survey/model';

const SurveyTable = () => {
  const { surveys, getSurveys, isLoading, error, selectedSurvey, setSelectedSurvey } = useSurveyStore();

  useEffect(() => {
    getSurveys().catch((e) => console.error(e));

    return () => {
      setSelectedSurvey('');
    };
  }, [getSurveys, setSelectedSurvey]);

  if (error) return <div>Error: {error.message}</div>;

  return (
    <>
      {isLoading ? <LoadingIndicator isOpen={isLoading} /> : null}
      <div className="w-full flex-1  pl-3 pr-3.5">
        <ScrollArea className="max-h-[80vh] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-white">
                <TableHead>
                  {
                    // display the table header to specify the visible information of a column
                  }
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="container">
              {surveys.map((row: Survey) => (
                <TableRow
                  key={`survey_row_-_${row.name}`}
                  data-state={row.name === selectedSurvey ? 'selected' : undefined}
                  className="cursor-pointer"
                >
                  <TableCell className="text-white">
                    {
                      // display some information about the survey
                      row.name
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>

      {selectedSurvey ? (
        <div className="flex-1 text-sm text-muted-foreground text-white">
          {
            // draw the selected survey
          }
        </div>
      ) : (
        <div className="flex-1 text-sm text-muted-foreground text-white">&nbsp;</div>
      )}
    </>
  );
};

export default SurveyTable;
