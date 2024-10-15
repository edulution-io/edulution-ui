import { Question } from 'survey-core/typings/question';
import ChoiceDto from '@libs/survey/types/api/choice.dto';

interface QuestionSettingsDialogStore {
  reset: () => void;

  isOpenQuestionSettingsDialog: boolean;
  setIsOpenQuestionSettingsDialog: (state: boolean) => void;

  selectedQuestion: Question | undefined;
  setSelectedQuestion: (question: Question | undefined) => void;

  onRemoveQuestionName: (questionName: string) => void;

  questionType: string;

  questionTitle: string;
  setQuestionTitle: (newTitle: string) => void;

  questionDescription: string;
  setQuestionDescription: (newDescription: string) => void;

  useBackendLimits: boolean;
  toggleUseBackendLimits: (surveyId?: string) => void;

  backendLimiters: { questionName: string; choices: ChoiceDto[] }[];
  setBackendLimiters: (backendLimiters: { questionName: string; choices: ChoiceDto[] }[]) => void;
  updateLimitersChoices: (choices: ChoiceDto[]) => { questionName: string; choices: ChoiceDto[] }[] | undefined;

  formerChoices: string[];
  choices: ChoiceDto[];

  addChoice: (name: string, title?: string, limit?: number) => void;
  addNewChoice: () => void;
  removeChoice: (choicesName: string) => void;
  setChoiceName: (choiceName: string, newName: string) => void;
  setChoiceTitle: (choiceName: string, newTitle: string) => void;
  setChoiceLimit: (choiceName: string, newLimit: number) => void;

  showOtherItem: boolean;
  toggleShowOtherItem: () => void;
}

export default QuestionSettingsDialogStore;
