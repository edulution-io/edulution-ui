import React, { useRef, useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useOnClickOutside } from 'usehooks-ts';
import cn from '@/lib/utils';
import styles from './dropdownmenu.module.scss';

export type DropdownOptions = {
  id: string;
  name: string;
};

interface DropdownProps {
  options: DropdownOptions[];
  selectedVal: string;
  handleChange: (value: string) => void;
  openToTop?: boolean;
  classname?: string;
}

const DropdownMenu: React.FC<DropdownProps> = ({
  options,
  selectedVal,
  handleChange,
  openToTop = false,
  classname,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = () => {
    setIsOpen(false);
  };

  useOnClickOutside(dropdownRef, handleClickOutside);

  const selectOption = (option: DropdownOptions) => {
    setQuery(() => '');
    handleChange(option.name);
    setIsOpen((prevVal) => !prevVal);
  };

  const getDisplayValue = (): string => {
    if (query) return query;
    if (selectedVal) return selectedVal;

    return '';
  };

  const filter = (opts: DropdownOptions[]): DropdownOptions[] =>
    opts.filter((option) => {
      const optionName = t(option.name);
      return optionName.toLowerCase().indexOf(query.toLowerCase()) > -1;
    });

  return (
    <div
      className={cn(styles.dropdown, classname)}
      ref={dropdownRef}
    >
      <div>
        <div className={styles['selected-value']}>
          <input
            type="text"
            value={getDisplayValue()}
            name="searchTerm"
            onChange={(e) => {
              setQuery(e.target.value);
              handleChange('');
            }}
            onClickCapture={() => setIsOpen((prevVal) => !prevVal)}
          />
        </div>
        <div className={clsx(styles.arrow, { [styles.open]: isOpen, [styles.up]: openToTop })} />
      </div>
      <div className={clsx(styles.options, { [styles.open]: isOpen, [styles.up]: openToTop })}>
        {filter(options).map((option) => (
          <div
            key={option.id}
            onClickCapture={() => selectOption(option)}
            className={clsx(styles.option, { [styles.selected]: t(option.name) === selectedVal })}
          >
            {t(option.name)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DropdownMenu;
