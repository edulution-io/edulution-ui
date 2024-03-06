import React, { MouseEventHandler, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import styles from './dropdownmenu.module.scss';

interface Options {
  id: string;
  name: string;
  link: string;
  icon: string;
}

interface Props {
  options: Options[];
  selectedVal: string;
  handleChange: (value: string) => void;
}

const DropdownMenu: React.FC<Props> = ({ options, selectedVal, handleChange }) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const toggle: MouseEventHandler<HTMLInputElement> = (e) => {
    setIsOpen(e && e.target === inputRef.current);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const selectOption = (option: Options) => {
    setQuery(() => '');
    handleChange(option.name);
    setIsOpen((prevVal) => !prevVal);
  };

  const getDisplayValue = (): string => {
    if (query) return query;
    if (selectedVal) return selectedVal;

    return '';
  };

  const filter = (opts: Options[]): Options[] =>
    opts.filter((option) => {
      const optionName = t(option.name);
      return optionName.toLowerCase().indexOf(query.toLowerCase()) > -1;
    });

  return (
    <div className={styles.dropdown}>
      <div>
        <div className={styles['selected-value']}>
          <input
            ref={inputRef}
            type="text"
            value={getDisplayValue()}
            name="searchTerm"
            onChange={(e) => {
              setQuery(e.target.value);
              handleChange('');
            }}
            onClickCapture={toggle}
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
            {t(option.name)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DropdownMenu;
