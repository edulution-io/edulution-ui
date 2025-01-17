import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PiDotsThreeVerticalBold } from 'react-icons/pi';
import { Card, CardContent } from '@/components/shared/Card';
import Field from '@/components/shared/Field';
import DropdownMenu from '@/components/shared/DropdownMenu';
import { Button } from '@/components/shared/Button';
import CircleLoader from '@/components/ui/CircleLoader';
import { type DropdownMenuItemType } from '@libs/ui/types/dropdownMenuItemType';
import DOCKER_COMMANDS from '@libs/docker/constants/dockerCommands';
import useDockerApplicationStore from './useDockerApplicationStore';

const DockerOverview: React.FC = () => {
  const { t } = useTranslation();
  const { isLoading, containers, fetchContainers, runDockerCommand, deleteDockerContainer } =
    useDockerApplicationStore();

  useEffect(() => {
    void fetchContainers();
  }, []);

  const dockerSettingsDropdownList = useMemo(
    () => (containerName: string) => {
      const items: DropdownMenuItemType[] = [];
      Object.entries(DOCKER_COMMANDS).forEach((item) => {
        items.push({
          label: t(`common.${item[1]}`),
          onClick: () => {
            void runDockerCommand(containerName, item[1]);
            return undefined;
          },
        });
      });

      items.push(
        { label: 'categorySeparator', isSeparator: true },
        {
          label: t('common.delete'),
          onClick: () => {
            void deleteDockerContainer(containerName);
            return undefined;
          },
        },
      );
      return items;
    },
    [t, runDockerCommand, deleteDockerContainer],
  );

  return (
    <div className="m-5">
      <div className="flex items-center justify-between">
        <h4>{t(`dockerOverview.title`)}</h4>
        <div className="absolute right-20 top-10">{isLoading ? <CircleLoader /> : null}</div>
      </div>
      <div className="m-4 flex flex-wrap">
        {containers.map((item) => (
          <Card
            key={item.Id}
            variant={item.State === 'running' ? 'infrastructure' : 'collaboration'}
            className="my-2 ml-1 mr-4 flex h-80 w-64 min-w-64 cursor-pointer"
            aria-label={item.Id}
          >
            <CardContent className="flex flex-col gap-2">
              <div className="mb-4 flex items-center justify-between ">
                <h4 className="font-bold">{item.Names[0].split('/')[1]}</h4>
                <DropdownMenu
                  trigger={
                    <Button
                      type="button"
                      className="text-white-500 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full p-0 hover:bg-blue-600 hover:text-white"
                      title={t('common.options')}
                    >
                      <PiDotsThreeVerticalBold className="h-6 w-6" />
                    </Button>
                  }
                  items={dockerSettingsDropdownList(item.Names[0].split('/')[1])}
                />
              </div>
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
    </div>
  );
};

export default DockerOverview;
