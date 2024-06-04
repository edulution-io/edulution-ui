import {
  AiOutlineDeliveredProcedure,
  AiOutlinePlusSquare,
  AiOutlineSave,
  AiOutlineUpSquare,
} from 'react-icons/ai';
import { BsGear } from 'react-icons/bs';
import { FiDelete, FiEdit, FiFilePlus } from 'react-icons/fi';
import { HiOutlineInboxIn } from "react-icons/hi";
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
  Abort: {
    icon: FiFilePlus,
    title: 'survey.editor.abort',
  },
  Options: {
    icon: BsGear,
    title: 'options',
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
  ResultingTable: {
    icon: HiOutlineInboxIn, // AiOutlineDownSquare,
    title: 'survey.resultTable',
  },
  ResultingPanel: {
    icon: HiOutlineArrowDownOnSquareStack, // AiOutlineDownSquare,
    title: 'survey.resultVisualization',
  },
  Save: {
    icon: AiOutlineSave,
    title: 'save',
  },
})

export default SurveyButtonProps;
