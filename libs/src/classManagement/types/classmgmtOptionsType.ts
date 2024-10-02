import CLASSMGMT_OPTIONS from '../constants/classmgmtOptions';

type ClassmgmtOptionsType = (typeof CLASSMGMT_OPTIONS)[keyof typeof CLASSMGMT_OPTIONS];

export default ClassmgmtOptionsType;
