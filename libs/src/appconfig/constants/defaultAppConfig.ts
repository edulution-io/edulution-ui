import { FilesharingIcon, SurveysIcon, ClassManagementIcon, WhiteboardIcon } from '@libs/assets';
import APPS from './apps';
import APP_INTEGRATION_VARIANT from './appIntegrationVariants';

const { FILE_SHARING, SURVEYS, CLASS_MANAGEMENT, WHITEBOARD } = APPS;
const { NATIVE } = APP_INTEGRATION_VARIANT;

const defaultAppConfig = [
  {
    name: FILE_SHARING,
    icon: FilesharingIcon,
    appType: NATIVE,
    options: {},
    accessGroups: [],
    extendedOptions: [],
  },
  {
    name: SURVEYS,
    icon: SurveysIcon,
    appType: NATIVE,
    options: {},
    accessGroups: [],
    extendedOptions: [],
  },
  {
    name: CLASS_MANAGEMENT,
    icon: ClassManagementIcon,
    appType: NATIVE,
    options: {},
    accessGroups: [],
    extendedOptions: [],
  },
  {
    name: WHITEBOARD,
    icon: WhiteboardIcon,
    appType: NATIVE,
    options: {},
    accessGroups: [],
    extendedOptions: [],
  },
];

export default defaultAppConfig;
