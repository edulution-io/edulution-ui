import React from 'react';
import { useSearchParams } from 'react-router-dom';
import FAQComponent from '@/pages/UserSettings/Components/FAQ/FAQComponent';
import SecurityComponent from '@/pages/UserSettings/Components/Security/SecurityComponent.tsx';
import ExternalIntegrationComponent from '@/pages/UserSettings/Components/ExternalIntegration/ExternalIntegrationComponent';

const UserSettings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const path = searchParams.get('section');

  const renderComponent = () => {
    switch (path) {
      case 'faq':
        return <FAQComponent />;
      case 'ExternalIntegration':
        return <ExternalIntegrationComponent />;
      case 'security':
      default:
        return <SecurityComponent />;
    }
  };

  return <div className="ml-5">{renderComponent()}</div>;
};

export default UserSettings;
