import React from 'react';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PollType } from '@/pages/Survey/Poll/poll-types';
import { Form } from '@/components/ui/Form';
import { DropdownMenu } from '@/components';
import Checkbox from '@/components/ui/Checkbox';
import { DropdownOptions } from '@/components/ui/DropdownMenu/DropdownMenu';
import AddOptionButton from '@/pages/Survey/Poll/components/AddOptionButton';

const PollEditor = () => {
  const { t } = useTranslation();

  const [type, setType] = React.useState<PollType | undefined>(undefined);
  const [typeName, setTypeName] = React.useState<string>(PollType.TEXT);

  const dropdownOptions = Object.keys(PollType).map((key) => ({ id: key, name: t(key) }));

  const [canParticipantsAddOptions, setCanParticipantsAddOptions] = React.useState<boolean>(false);
  const [canParticipantSelectMultipleOptions, setCanParticipantSelectMultipleOptions] = React.useState<boolean>(true);

  // const [currentParticipants, setCurrentParticipants] = React.useState<Participant[]>([]);
  // TODO: Add the function to select a group/class as participants

  // const addParticipant = (participant: Participant) => {
  //   if (currentParticipants.includes(participant)) {
  //     throw new Error('Participant is already included');
  //     return;
  //   }
  //
  //   const updatedParticipantArray = currentParticipants;
  //   updatedParticipantArray.push(participant);
  //   setCurrentParticipants(updatedParticipantArray);
  // };

  const [currentOptions, setCurrentOptions] = React.useState<string[] | Date[] | number[]>([]);
  const [newOption, setNewOption] = React.useState<string | Date[] | undefined>(undefined);

  const addOption = (option: string | Date | undefined) => {
    if (!option || type === PollType.RATING) {
      return;
    }

    // @ts-expect-error - the option type corresponds to the type of the poll ("Text" | "Date" | "Rating")
    if (currentOptions.includes(option)) {
      throw new Error('Option already exists');
      return;
    }

    const updatedOptionsArray = currentOptions;
    // @ts-expect-error - the option type corresponds to the type of the poll ("Text" | "Date" | "Rating")
    updatedOptionsArray.push(option);
    setCurrentOptions(updatedOptionsArray);
  };

  const addNewOption = (option: string | Date[] | undefined) => {
    if (Array.isArray(option)) {
      option.forEach((date) => addOption(date));
      return;
    }

    addOption(option);
  };

  const updateDropdownChange = (option: DropdownOptions) => {
    setTypeName(option.name);

    const newType =
      (option.id as keyof typeof PollType) in PollType ? PollType[option.id as keyof typeof PollType] : undefined;

    if (type !== newType) {
      setCurrentOptions([]);
      setNewOption(undefined);
    }
    setType(newType);
  };

  const formSchemaObject: { [key: string]: z.Schema } = {
    type: z.nativeEnum(PollType).optional(),
    typeName: z.string(),
    canParticipantsAddOptions: z.boolean().optional(),
    canParticipantSelectMultipleOptions: z.boolean().optional(),
    currentOptions: z.array(z.string().optional() || z.date().optional() || z.number().optional()).optional(),
    participants: z
      .array(
        z.object({
          displayText: z.string(),
          selection: z.array(z.string().optional() || z.date().optional() || z.number().optional()).optional(),
        }),
      )
      .optional(),
  };

  const formSchema = z.object(formSchemaObject);

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
  });

  const { register, handleSubmit } = form;

  return (
    <Form {...form}>
      <form
        className="column"
        onSubmit={handleSubmit(() => {})}
      >
        <div className="pb-10 pt-2">
          <div className="w-2/3">
            <DropdownMenu
              {...register('typeName')}
              options={dropdownOptions}
              selectedVal={typeName}
              handleChange={(value) => updateDropdownChange(value)}
            />

            {
              // eslint-disable-next-line
              <div
                className="m-2 inline-flex items-center text-gray-100"
                onClick={() => setCanParticipantsAddOptions(!canParticipantsAddOptions)}
              >
                <Checkbox checked={canParticipantsAddOptions} />
                <div className="pl-2">{t('survey.poll.canParticipantsAddOptions')}</div>
              </div>
            }

            {
              // eslint-disable-next-line
              <div
                className="m-2 inline-flex items-center text-gray-100"
                onClick={() => setCanParticipantSelectMultipleOptions(!canParticipantSelectMultipleOptions)}
              >
                <Checkbox checked={canParticipantSelectMultipleOptions} />
                <div className="pl-2">{t('survey.poll.canParticipantSelectMultipleOptions')}</div>
              </div>
            }

            <div className="mb-4 mt-2 w-full">
              PARTICIPANTS:
              {/* {currentParticipants.map((participant, index) => ( */}
              {/*   <div */}
              {/*     key={`poll_table_row_participant_${index}`} */}
              {/*     className="center rounded bg-gray-500 p-2 text-gray-900" */}
              {/*   > */}
              {/*     {participant.displayText} */}
              {/*   </div> */}
              {/* ))} */}
              {/* TODO: Add the function to select a group/class as participants */}
              <div>COMING SOON: SELECT A GROUP AS PARTICIPANTS</div>
              <div>COMING SOON: SELECT SINGLE PARTICIPANT</div>
            </div>

            {type !== PollType.RATING ? (
              <div className="w-full">
                OPTIONS:
                {currentOptions.map((option) => (
                  <div
                    key={`poll_table_header_option_${option.toString()}`}
                    className="center rounded bg-gray-500 p-2 text-gray-900"
                  >
                    {option.toString()}
                  </div>
                ))}
                <AddOptionButton
                  type={type || PollType.TEXT}
                  option={newOption}
                  setOption={setNewOption}
                  addOption={addNewOption}
                />
              </div>
            ) : null}
          </div>
        </div>
      </form>
    </Form>
  );
};

export default PollEditor;
