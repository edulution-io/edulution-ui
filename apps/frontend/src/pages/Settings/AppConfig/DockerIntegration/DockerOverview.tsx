import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/shared/Card';
import Field from '@/components/shared/Field';
import useDockerApplicationStore from './useDockerApplicationStore';

const DockerOverview: React.FC = () => {
  const { t } = useTranslation();
  const { containers, fetchContainers } = useDockerApplicationStore();

  useEffect(() => {
    void fetchContainers();
  }, []);

  return (
    <>
      <h4>{t(`dockerOverview.title`)}</h4>
      <div className="flex flex-wrap">
        {containers.map((item) => (
          <Card
            key={item.Id}
            variant={item.State === 'running' ? 'infrastructure' : 'collaboration'}
            className="my-2 ml-1 mr-4 flex h-80 w-64 min-w-64 cursor-pointer"
            aria-label={item.Id}
          >
            <CardContent className="flex flex-col gap-2">
              <h4 className="mb-4 font-bold">{item.Names[0]}</h4>
              <Field
                key="dockerOverview-container"
                value={item.Image}
                labelTranslationId="dockerOverview.containerName"
                readOnly
                variant="lightGrayDisabled"
              />
              <Field
                key="dockerOverview-state"
                value={item.State}
                labelTranslationId="dockerOverview.state"
                readOnly
                variant="lightGrayDisabled"
              />
              <Field
                key="dockerOverview-status"
                value={item.Status}
                labelTranslationId="dockerOverview.status"
                readOnly
                variant="lightGrayDisabled"
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};

export default DockerOverview;
