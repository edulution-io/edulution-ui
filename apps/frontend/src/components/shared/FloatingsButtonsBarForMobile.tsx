import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FloatingButtonsBarConfig from '@libs/common/types/floatingButtonsBarConfig';
import { Button } from '@/components/shared/Button';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';

type FloatingButtonsBarProps = {
  config: FloatingButtonsBarConfig;
};

const FloatingButtonsBarForMobile = (props: FloatingButtonsBarProps) => {
  const { config } = props;

  const [isOpen, setIsOpen] = useState(false);

  const { t } = useTranslation();

  const { buttons, keyPrefix } = config;
  const floatingButtons = useMemo(
    () =>
      buttons.map((conf, index) => {
        const { icon, text, onClick, isVisible = true } = conf;
        return isVisible ? (
          // eslint-disable-next-line react/no-array-index-key
          <div key={`${keyPrefix}${index}`}>
            <FloatingActionButton
              icon={icon}
              text={text}
              onClick={onClick}
            />
          </div>
        ) : null;
      }),
    [config],
  );

  const getDialogBody = () => <div className="flex flex-wrap justify-center p-4">{floatingButtons}</div>;

  return (
    <>
      <Button
        type="button"
        variant="btn-hexagon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2"
      >
        {t('common.actions')}
      </Button>
      <AdaptiveDialog
        isOpen={isOpen}
        variant="secondary"
        handleOpenChange={() => setIsOpen(!isOpen)}
        title={t('common.actions')}
        body={getDialogBody()}
        mobileContentClassName="h-fit h-max-1/2"
      />
    </>
  );
};

export default FloatingButtonsBarForMobile;
