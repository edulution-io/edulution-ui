import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ManageContentPage from '@/pages/SchoolmanagementPage/components/ManageContentPage';

const ManageClassPage = () => {
  const [searchParams] = useSearchParams();
  const classParam = searchParams.get('class');
  const sessionParam = searchParams.get('session');
  const projectParam = searchParams.get('project');

  if (classParam) {
    return (
      <ManageContentPage
        contentKey={classParam}
        contentType="class"
      />
    );
  }
  if (sessionParam) {
    return (
      <ManageContentPage
        contentKey={sessionParam}
        contentType="session"
      />
    );
  }
  if (projectParam) {
    return (
      <ManageContentPage
        contentKey={projectParam}
        contentType="project"
      />
    );
  }

  return <div>No content selected</div>;
};

export default ManageClassPage;
