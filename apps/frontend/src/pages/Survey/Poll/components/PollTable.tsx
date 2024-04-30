import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/Form';
import { Table } from '@/components/ui/Table';
import { Participant, PollSelection, PollSelectionCellState, PollType } from '@/pages/Survey/Poll/poll-types';
import PollHeader from '@/pages/Survey/Poll/components/TableHeader/PollHeader';
import PollBody from '@/pages/Survey/Poll/components/TableBody/PollBody';

interface PollProps {
  pollType?: PollType;
  pollName?: string;
  options?: string[] | Date[] | number[];
  participants?: Participant[];
  canParticipantsAddOptions?: boolean;
  canParticipantSelectMultipleOptions?: boolean;
}

const PollTable = (props: PollProps) => {
  const {
    pollType = PollType.TEXT,
    pollName = 'DefaultPollName',
    options = [],
    participants = [],
    canParticipantsAddOptions = true,
    canParticipantSelectMultipleOptions = true,
  } = props;

  const [currentOptions, setCurrentOptions] = React.useState<string[] | Date[] | number[]>(options || []);
  const [newOption, setNewOption] = React.useState<string | Date[] | undefined>(undefined);

  const [currentParticipantName, setCurrentParticipantName] = React.useState<string>('');
  const [currentSelection, setCurrentSelection] = React.useState<PollSelection[]>([]);

  useEffect(() => {
    const initialSelection = options.map((option) => ({
      option,
      state: PollSelectionCellState.DENIED,
    }));
    setCurrentSelection(initialSelection);
  }, []);

  const formSchemaObject: { [key: string]: z.Schema } = {
    options: z.array(z.string().optional() || z.date().optional() || z.number().optional()).optional(),
    participants: z
      .array(
        z.object({
          displayText: z.string(),
          selection: z.array(z.string().optional() || z.date().optional() || z.number().optional()).optional(),
        }),
      )
      .optional(),
    participantName: z.string().optional(),
    currentSelection: z
      .array(
        z.object({
          option: z.string().optional() || z.date().optional() || z.number().optional(),
          state: z.nativeEnum(PollSelectionCellState).optional(),
        }),
      )
      .optional(),
  };

  const formSchema = z.object(formSchemaObject);

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'all',
    resolver: zodResolver(formSchema),
    defaultValues: {
      options,
      participants,
      participantName: '',
      currentSelection: options.map((option) => ({
        option,
        state: PollSelectionCellState.DENIED,
      })),
      newOption: [],
    },
  });

  const { register, handleSubmit } = form;

  return (
    <Form {...form}>
      <form
        className="column p-4"
        onSubmit={handleSubmit(() => {})}
      >
        <Table className="mb-10">
          <PollHeader
            {...register}
            pollType={pollType}
            pollName={pollName}
            canParticipantsAddOptions={canParticipantsAddOptions}
            currentOptions={currentOptions}
            setCurrentOptions={setCurrentOptions}
            participants={participants}
            currentSelection={currentSelection}
            setCurrentSelection={setCurrentSelection}
            newOption={newOption}
            setNewOption={setNewOption}
          />
          <PollBody
            {...register}
            pollType={pollType}
            pollName={pollName}
            participants={participants}
            currentSelection={currentSelection}
            setCurrentSelection={setCurrentSelection}
            currentParticipantName={currentParticipantName}
            setCurrentParticipantName={setCurrentParticipantName}
            canParticipantSelectMultipleOptions={canParticipantSelectMultipleOptions}
          />
        </Table>
      </form>
    </Form>
  );
};

export default PollTable;
