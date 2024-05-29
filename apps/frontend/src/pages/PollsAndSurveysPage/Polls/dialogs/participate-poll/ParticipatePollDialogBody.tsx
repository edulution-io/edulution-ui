import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import PollParticipation from '@/pages/PollsAndSurveysPage/Polls/dialogs/participate-poll/PollParticipation';

interface ParticipatePollDialogBodyProps {
  pollName: string;
  pollString: string;
  closeParticipatePollDialog: () => void;
  isAnswering: boolean;

  handleFormSubmit: () => void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

const ParticipatePollDialogBody = (props: ParticipatePollDialogBodyProps) => {
  const { pollName, pollString, isAnswering, closeParticipatePollDialog, handleFormSubmit, form } = props;

  if (isAnswering) return <div>Loading...</div>;

  return (
    <PollParticipation
      pollName={pollName}
      pollString={pollString}
      closeParticipatePollDialog={closeParticipatePollDialog}
      handleFormSubmit={handleFormSubmit}
      form={form}
    />
  );
};

export default ParticipatePollDialogBody;
