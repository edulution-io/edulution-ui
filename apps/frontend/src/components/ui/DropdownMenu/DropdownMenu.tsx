import React, { useRef, useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useOnClickOutside } from 'usehooks-ts';

import styles from './dropdownmenu.module.scss';

export type DropdownOptions = {
  id: string;
  name: string;
  icon?: JSX.Element; // Add this property
};

interface DropdownProps {
  options: DropdownOptions[];
  selectedVal: string;
  handleChange: (value: DropdownOptions) => void;
}

const DropdownMenu: React.FC<DropdownProps> = ({ options, selectedVal, handleChange }) => {
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
    handleChange(option);
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
      className={styles.dropdown}
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
              handleChange({} as DropdownOptions);
            }}
            onClickCapture={() => setIsOpen((prevVal) => !prevVal)}
          />
        </div>
        <div className={clsx(styles.arrow, { [styles.open]: isOpen })} />
      </div>
      <div className={clsx(styles.options, { [styles.open]: isOpen })}>
        {filter(options).map((option) => (
          <div
            key={option.id}
            onClickCapture={() => selectOption(option)}
            className={clsx(styles.option, { [styles.selected]: t(option.name) === selectedVal })}
          >
            <div className="flex flex-row items-center">
              <span className={styles.icon}>{option.icon}</span> {/* Display the icon */}
              {t(option.name)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DropdownMenu;
