import React, { useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ConferencesIcon } from '@/assets/icons';
import { BUTTONS_ICON_WIDTH } from '@/constants/style';
import { Card, CardContent } from '@/components/shared/Card';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/Collapsible';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import Conference from '@/pages/ConferencePage/dto/conference.dto';
import useCurrentAffairsStore from '@/components/feature/CurrentAffairs/CurrentAffairsStore';
import ConferencesList from '@/components/feature/CurrentAffairs/components/ConferencesList';

const CurrentAffairs = () => {
  const { t } = useTranslation();

  const { shouldUpdate, isUpdating, start, finish } = useCurrentAffairsStore();
  const { conferences, getConferences } = useConferenceStore();

  const cyclicUpdate = useCallback(async (): Promise<void> => {
    if (shouldUpdate && !isUpdating) {
      start();
      try {
        await getConferences();
      } catch (e) {
        console.error(e);
      }
      finish();
    }
  }, []);

  useEffect(() => {
    if (shouldUpdate) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      cyclicUpdate();
    }
  }, [shouldUpdate]);

  const filteredConferences = useMemo(
    () => conferences.filter((conference: Conference) => conference.isRunning),
    [conferences],
  );

  return (
    <Card
      variant="collaboration"
      className="min-h-[100%] overflow-auto"
      style={{ height: '10px', maxHeight: 'initial', width: '100%' }}
    >
      <CardContent>
        <div className="flex flex-col gap-3">
          <h4 className="font-bold">{t('current-affairs.title')}</h4>
          <ScrollArea>
            <Collapsible defaultOpen>
              <CollapsibleTrigger className="flex text-xl font-bold">
                <img
                  src={ConferencesIcon}
                  alt="conference-notification"
                  width={BUTTONS_ICON_WIDTH}
                  className="mr-4"
                />
                {t('conferences.sidebar')}
              </CollapsibleTrigger>
              <CollapsibleContent>
                {filteredConferences.length > 0 ? (
                  <ConferencesList
                    items={filteredConferences}
                    className="mb-6 mt-2"
                  />
                ) : (
                  <div className="mb-6 mt-2 text-center">{t('current-affairs.noConferences')}</div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentAffairs;
