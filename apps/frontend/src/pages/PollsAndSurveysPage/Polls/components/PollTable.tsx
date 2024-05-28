import React from 'react';
import { ScrollArea } from '@/components/ui/ScrollArea';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { Poll } from '@/pages/PollsAndSurveysPage/Polls/backend-copy/model';
// import PollCardRow from '@/pages/PollsAndSurveysPage/Polls/components/PollCardRow';
import { PollUpdateSelection } from '@/pages/PollsAndSurveysPage/Polls/PollPageStore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import UsersPollsTypes from '@/pages/PollsAndSurveysPage/Polls/backend-copy/users-polls-types-enum.dto';

interface PollTableProps {
  pollType: UsersPollsTypes;
  polls: Poll[];
  title: string;
  isLoading: boolean;
  // selectedPoll: Poll | undefined;
  updatePollSelection: (selection: PollUpdateSelection) => void;
  // openCreateDialog: () => void;
  // deletePoll: (pollName: string | undefined) => Promise<void>;
}

const PollTable = (props: PollTableProps) => {
  const {
    pollType,
    polls,
    title,
    isLoading,
    // selectedPoll,
    updatePollSelection,
    // openCreateDialog,
    // deletePoll,
  } = props;

  if (isLoading) {
    return <LoadingIndicator isOpen={isLoading}/>
  }

  if (polls.length === 0) {
    return (
      <div className="w-50 m-4 flex-1 pl-3 pr-3.5">
        <h4>{title}</h4>
        <ScrollArea>
          <div>EMPTY</div>
        </ScrollArea>
      </div>
    );
  }

  // return (
  //   <div className="w-50 m-4 flex-1 pl-3 pr-3.5">
  //     {title}
  //     <ScrollArea className="max-h-[80vh] overflow-y-auto overflow-x-hidden">
  //       <PollCardRow
  //         polls={polls}
  //         selectedPoll={selectedPoll}
  //         updatePollSelection={updatePollSelection}
  //         openCreateDialog={openCreateDialog}
  //         deletePoll={deletePoll}
  //         isAdmin={true}
  //       />
  //     </ScrollArea>
  //   </div>
  // );

  return (
    <div className="w-50 m-4 flex-1 pl-3 pr-3.5">
      <h4>{title}</h4>
      <Table>
        <TableHeader>
          <TableRow className="text-2xl text-white">
            <TableHead>Title</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Participant count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="container">
          {polls.map((poll: Poll) => {
            if (!poll.poll) {
              return null;
            }
            const pl = JSON.parse(JSON.stringify(poll.poll));
            return (
              <TableRow
                key={`poll_row_-_${poll.pollName}`}
                className="cursor-pointer"
                onClick={() => {
                  updatePollSelection({poll, pollType});
                }}
              >
                <TableCell className="text-white">{pl.title}</TableCell>
                <TableCell className="text-white">{poll.created ? poll.created.toString() : 'not-available'}</TableCell>
                <TableCell className="text-white">{poll.participants.length || 0}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default PollTable;
