import React, { useRef, useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useOnClickOutside } from 'usehooks-ts';
import cn from '@libs/common/utils/className';
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
  variant?: 'light' | 'dark';
}

const DropdownMenu: React.FC<DropdownProps> = ({
  options,
  selectedVal,
  handleChange,
  openToTop = false,
  classname,
  variant = 'dark',
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
      className={cn(styles.dropdown, classname, {
        [styles.dark]: variant === 'dark',
        [styles.light]: variant === 'light',
      })}
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
            disabled={options.length === 0}
            className={clsx({
              'bg-white text-black': variant === 'light',
              'bg-ciDarkGrey text-ciLightGrey': variant === 'dark',
            })}
          />
        </div>
        <div className={clsx(styles.arrow, { [styles.open]: isOpen, [styles.up]: openToTop })} />
      </div>
      <div
        className={clsx(styles.options, {
          [styles.open]: isOpen,
          [styles.up]: openToTop,
          'bg-white text-black': variant === 'light',
          'bg-ciDarkGrey text-ciLightGrey': variant === 'dark',
        })}
      >
        {filter(options).map((option) => (
          <div
            key={option.id}
            onClickCapture={() => selectOption(option)}
            className={clsx(styles.option, {
              [styles.selected]: t(option.name) === selectedVal,
              'hover:bg-gray-200': variant === 'light',
              'bg-ciDarkGrey hover:bg-white': variant === 'dark',
            })}
          >
            {t(option.name)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DropdownMenu;
