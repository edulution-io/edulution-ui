import {
  AiOutlineDeliveredProcedure, /* AiOutlineDownSquare, */
  AiOutlinePlusSquare, AiOutlineSave,
  AiOutlineUpSquare
} from 'react-icons/ai';
import { BsGear } from 'react-icons/bs';
import { FiDelete, FiEdit } from 'react-icons/fi';
import { HiOutlineArrowDownOnSquare, HiOutlineArrowDownOnSquareStack } from 'react-icons/hi2';

const SurveyButtonProps = ({
  All: {
    icon: AiOutlinePlusSquare,
    title: 'survey.allSurveys',
  },
  Answer: {
    icon: HiOutlineArrowDownOnSquare, // AiOutlineDownSquare,
    title: 'survey.answer',
  },
  Create: {
    icon: AiOutlinePlusSquare,
    title: 'survey.create',
  },
  Delete: {
    icon: FiDelete,
    title: 'survey.delete',
  },
  Edit: {
    icon: FiEdit,
    title: 'survey.edit',
  },
  New: {
    icon: AiOutlinePlusSquare,
    title: 'new',
  },
  Options: {
    icon: BsGear,
    title: 'survey.options',
  },
  Participate: {
    icon: AiOutlineUpSquare,
    title: 'survey.participate',
  },
  Propagate: {
    icon: AiOutlineDeliveredProcedure,
    title: 'survey.propagate',
  },
  Results: {
    icon: HiOutlineArrowDownOnSquareStack, // AiOutlineDownSquare,
    title: 'survey.result',
  },
  Save: {
    icon: AiOutlineSave,
    title: 'save',
  },
})

export default SurveyButtonProps;
