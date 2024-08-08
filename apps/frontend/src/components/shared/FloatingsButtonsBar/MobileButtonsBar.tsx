import React, { useState, useMemo } from 'react';
import { HiOutlineChevronDoubleUp, HiOutlineChevronDoubleDown } from 'react-icons/hi';
import FloatingButtonsBarConfig from '@libs/common/types/floatingButtonsBarConfig';
import { Button } from '@/components/shared/Button';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { IconContext } from 'react-icons';

type FloatingButtonsBarProps = {
  config: FloatingButtonsBarConfig;
};

const MobileButtonsBar = (props: FloatingButtonsBarProps) => {
  const { config } = props;

  const [isOpen, setIsOpen] = useState(false);

  const { buttons, keyPrefix } = config;
  const floatingButtons = useMemo(
    () =>
      buttons.map((conf, index) => {
        const {
          icon,
          text,
          onClick,
          isVisible = true,
          variant = 'button',
          options = undefined,
          onSelectFileSelect = undefined,
        } = conf;
        return isVisible ? (
          // eslint-disable-next-line react/no-array-index-key
          <div key={`${keyPrefix}${index}`}>
            <FloatingActionButton
              variant={variant}
              icon={icon}
              text={text}
              onClick={onClick}
              options={options}
              onSelectFileSelect={onSelectFileSelect}
            />
          </div>
        ) : null;
      }),
    [config],
  );

  const getDialogBody = () => <div className="flex flex-wrap justify-center p-4">{floatingButtons}</div>;

  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8 m-5' }), []);

  return (
    <>
      <Button
        type="button"
        variant="btn-hexagon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 scale-90"
      >
        <IconContext.Provider value={iconContextValue}>
          {isOpen ? <HiOutlineChevronDoubleDown /> : <HiOutlineChevronDoubleUp />}
        </IconContext.Provider>
      </Button>
      <AdaptiveDialog
        isOpen={isOpen}
        variant="secondary"
        handleOpenChange={() => setIsOpen(!isOpen)}
        title=""
        body={getDialogBody()}
        mobileContentClassName="h-fit h-max-1/2"
      />
    </>
  );
};

export default MobileButtonsBar;
