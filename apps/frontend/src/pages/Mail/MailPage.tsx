import React from 'react';
import APPS from '@libs/appconfig/constants/apps';
import NativeIframeLayout from '@/components/framing/Native/NativeIframeLayout';

const MailPage: React.FC = () => <NativeIframeLayout appName={APPS.MAIL} />;

export default MailPage;
