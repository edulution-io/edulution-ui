import React, { useEffect } from 'react';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/shared/Card';
import useDockerApplicationStore from './useDockerApplicationStore';

const DockerApplicationHandler: React.FC = () => {
  const { t } = useTranslation();
  const { containers, fetchContainers } = useDockerApplicationStore();

  useEffect(() => {
    void fetchContainers();
  }, []);

  return (
    <AccordionSH type="multiple">
      <AccordionItem value="docker">
        <AccordionTrigger className="flex text-h4">
          <h4>{t(`dockerApplication.title`)}</h4>
        </AccordionTrigger>
        <AccordionContent className="space-y-2 px-1">
          {containers.map((item) => (
            <Card
              key={item.Id}
              variant={item.State === 'running' ? 'infrastructure' : 'collaboration'}
              className="grid w-72 grid-cols-3 gap-4 p-4 shadow"
              aria-label={item.Id}
            >
              <p>{item.Names[0]}</p>
            </Card>
          ))}
        </AccordionContent>
      </AccordionItem>
    </AccordionSH>
  );
};

export default DockerApplicationHandler;
