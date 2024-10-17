import React from 'react';
import getLoginScript from '@/pages/LearningManagement/scripts/login';
import logoutScript from '@/pages/LearningManagement/scripts/logout';
import APPS from '@libs/appconfig/constants/apps';
import NativeIframeWithScripts from '@/components/framing/Native/NativeIframeWithScripts';

const LearningManagementPage: React.FC = () => (
  <NativeIframeWithScripts
    appName={APPS.LEARNING_MANAGEMENT}
    getLoginScript={getLoginScript}
    logoutScript={logoutScript}
  />
);

export default LearningManagementPage;
