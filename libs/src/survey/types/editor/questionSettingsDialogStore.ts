import { Question } from 'survey-core/typings/question';
import ChoiceDto from '@libs/survey/types/api/choice.dto';

interface QuestionSettingsDialogStore {
  reset: () => void;

  isOpenQuestionSettingsDialog: boolean;
  setIsOpenQuestionSettingsDialog: (state: boolean) => void;

  selectedQuestion: Question | undefined;
  setSelectedQuestion: (question: Question | undefined) => void;

  backendLimiters: { questionName: string; choices: ChoiceDto[] }[];
  setBackendLimiters: (backendLimiters: { questionName: string; choices: ChoiceDto[] }[]) => void;
  updateLimitersChoices: (limitedChoices: ChoiceDto[]) => void;
  onRemoveQuestionName: (questionName: string) => void;

  choices: ChoiceDto[];

  addNewChoice: () => void;
  setName: (choiceIndex: number, name: string) => void;
  setTitle: (choiceIndex: number, title: string) => void;
  setLimit: (choiceIndex: number, limit: number) => void;
  removeChoice: (choicesName: string) => void;
}

export default QuestionSettingsDialogStore;
