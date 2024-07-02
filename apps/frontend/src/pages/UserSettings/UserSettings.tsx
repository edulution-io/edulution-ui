import React from 'react';
import { useSearchParams } from 'react-router-dom';
import SecurityComponent from '@/pages/UserSettings/Components/Security/SecurityComponent';

const UserSettings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const path = searchParams.get('section');

  const renderComponent = () => {
    switch (path) {
      case 'security':
      default:
        return <SecurityComponent />;
    }
  };

  return <div className="ml-5">{renderComponent()}</div>;
};

export default UserSettings;
