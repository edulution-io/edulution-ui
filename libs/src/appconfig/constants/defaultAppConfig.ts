import { FilesharingIcon, SurveysIcon, ClassManagementIcon, WhiteboardIcon } from '@libs/assets';
import APP_CONFIG_SECTION_OPTIONS_GENERAL from '@libs/appconfig/constants/appConfigSectionOptionsGeneral';
import APP_CONFIG_SECTION_OPTIONS_ONLY_OFFICE from '@libs/appconfig/constants/appConfigSectionOptionsOnlyOffice';
import APPS from './apps';
import APP_INTEGRATION_VARIANT from './appIntegrationVariants';

const { FILE_SHARING, SURVEYS, CLASS_MANAGEMENT, WHITEBOARD } = APPS;
const { NATIVE } = APP_INTEGRATION_VARIANT;

const defaultAppConfig = [
  {
    name: FILE_SHARING,
    icon: FilesharingIcon,
    appType: NATIVE,
    options: [APP_CONFIG_SECTION_OPTIONS_GENERAL, APP_CONFIG_SECTION_OPTIONS_ONLY_OFFICE],
    accessGroups: [],
  },
  {
    name: SURVEYS,
    icon: SurveysIcon,
    appType: NATIVE,
    options: [APP_CONFIG_SECTION_OPTIONS_GENERAL],
    accessGroups: [],
  },
  {
    name: CLASS_MANAGEMENT,
    icon: ClassManagementIcon,
    appType: NATIVE,
    options: [APP_CONFIG_SECTION_OPTIONS_GENERAL],
    accessGroups: [],
  },
  {
    name: WHITEBOARD,
    icon: WhiteboardIcon,
    appType: NATIVE,
    options: [APP_CONFIG_SECTION_OPTIONS_GENERAL],
    accessGroups: [],
  },
];

export default defaultAppConfig;
