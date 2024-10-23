import React, { useMemo, useState } from 'react';
import { HiOutlineChevronDoubleDown, HiOutlineChevronDoubleUp } from 'react-icons/hi';
import FloatingButtonsBarProps from '@libs/ui/types/FloatingButtons/floatingButtonsProps';
import { Button } from '@/components/shared/Button';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { IconContext } from 'react-icons';
import { useTranslation } from 'react-i18next';

const MobileButtonsBar: React.FC<FloatingButtonsBarProps> = (props) => {
  const { config } = props;
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const { buttons, keyPrefix } = config;
  const floatingButtons = buttons.map((conf, index) => {
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
  });

  const getDialogBody = () => <div className="flex flex-wrap justify-center p-4">{floatingButtons}</div>;

  const iconContextValue = useMemo(() => ({ className: 'h-8 w-8 m-5' }), []);

  return (
    <>
      <Button
        type="button"
        variant="btn-hexagon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2"
        hexagonIconAltText={isOpen ? t('common.close') : t('common.open')}
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
        desktopContentClassName=" bg-black"
      />
    </>
  );
};

export default MobileButtonsBar;
