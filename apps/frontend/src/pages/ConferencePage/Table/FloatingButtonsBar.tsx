import React, { useMemo } from 'react';
import { TooltipProvider } from '@/components/ui/Tooltip';
import ActionTooltip from '@/pages/FileSharing/utilities/ActionTooltip';
import { Button } from '@/components/shared/Button';
import { IconContext } from 'react-icons';
import { MdAdd, MdOutlineDeleteOutline } from 'react-icons/md';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import { useTranslation } from 'react-i18next';
import CreateConferenceDialog from '@/pages/ConferencePage/CreateConference/CreateConferenceDialog';
import DeleteConferencesDialog from '@/pages/ConferencePage/Table/DeleteConferencesDialog';
import { TfiReload } from 'react-icons/tfi';

const FloatingButtonsBar = () => {
  const { selectedRows, getConferences, conferences } = useConferenceStore();
  const { t } = useTranslation();

  const selectedConferenceIds = Object.keys(selectedRows);
  const selectedConferences = conferences.filter((c) => selectedConferenceIds.includes(c.meetingID));
  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8 m-5' }), []);

  return (
    <div className="fixed bottom-8 flex flex-row space-x-24 bg-opacity-90">
      <TooltipProvider>
        {selectedConferenceIds.length === 0 ? (
          <ActionTooltip
            onAction={() => {}}
            tooltipText={t('conferences.create')}
            trigger={
              <CreateConferenceDialog
                trigger={
                  <Button
                    type="button"
                    variant="btn-hexagon"
                    className="fixed bottom-10 space-x-4 bg-opacity-90 p-4"
                  >
                    <IconContext.Provider value={iconContextValue}>
                      <MdAdd />
                    </IconContext.Provider>
                  </Button>
                }
              />
            }
          />
        ) : (
          <div className="flex flex-row space-x-24">
            <ActionTooltip
              onAction={() => {}}
              tooltipText={t('conferences.delete')}
              trigger={
                <DeleteConferencesDialog
                  trigger={
                    <Button
                      type="button"
                      variant="btn-hexagon"
                      className="fixed bottom-10 space-x-4 bg-opacity-90 p-4"
                    >
                      <IconContext.Provider value={iconContextValue}>
                        <MdOutlineDeleteOutline />
                      </IconContext.Provider>
                    </Button>
                  }
                  conferences={selectedConferences}
                />
              }
            />
          </div>
        )}

        <ActionTooltip
          onAction={() => {
            getConferences().catch((e) => console.error(e));
          }}
          tooltipText={t('common.reload')}
          trigger={
            <Button
              type="button"
              variant="btn-hexagon"
              className="fixed bottom-10 space-x-4 bg-opacity-90 p-4"
            >
              <IconContext.Provider value={iconContextValue}>
                <TfiReload />
              </IconContext.Provider>
            </Button>
          }
        />
      </TooltipProvider>
    </div>
  );
};

export default FloatingButtonsBar;
