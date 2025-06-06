/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

'use client';

/* eslint-disable react/no-unknown-property, react/no-unstable-nested-components, @typescript-eslint/no-shadow, react/button-has-type, @typescript-eslint/no-unused-expressions, react/jsx-no-useless-fragment */

import * as React from 'react';
import { forwardRef, useEffect } from 'react';
import { Command as CommandPrimitive, useCommandState } from 'cmdk';
import { X } from 'lucide-react';

import cn from '@libs/common/utils/className';
import { BadgeSH } from '@/components/ui/BadgeSH';
import { CommandGroup, CommandItem, CommandList, CommandSH } from '@/components/ui/CommandSH';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';
import { useDebounceValue } from 'usehooks-ts';

interface GroupOption {
  [key: string]: MultipleSelectorOptionSH[];
}

interface MultipleSelectorProps {
  showRemoveIconInBadge?: boolean;
  value?: MultipleSelectorOptionSH[];
  defaultOptions?: MultipleSelectorOptionSH[];
  /** manually controlled options */
  options?: MultipleSelectorOptionSH[];
  placeholder?: string;
  /** Loading component. */
  loadingIndicator?: React.ReactNode;
  /** Empty component. */
  emptyIndicator?: React.ReactNode;
  /** Debounce time for async search. Only work with `onSearch`. */
  delay?: number;
  /**
   * Only work with `onSearch` prop. Trigger search when `onFocus`.
   * For example, when user click on the input, it will trigger the search to get initial options.
   * */
  triggerSearchOnFocus?: boolean;
  /** async search */
  onSearch?: (value: string) => Promise<MultipleSelectorOptionSH[]>;
  onChange?: (options: MultipleSelectorOptionSH[]) => void;
  /** Limit the maximum number of selected options. */
  maxSelected?: number;
  /** When the number of selected options exceeds the limit, the onMaxSelected will be called. */
  onMaxSelected?: (maxLimit: number) => void;
  /** Hide the placeholder when there are options selected. */
  hidePlaceholderWhenSelected?: boolean;
  disabled?: boolean;
  /** Group the options base on provided key. */
  groupBy?: string;
  className?: string;
  badgeClassName?: string;
  variant?: 'default' | 'dialog';
  /**
   * First item selected is a default behavior by cmdk. That is why the default is true.
   * This is a workaround solution by add a dummy item.
   *
   * @reference: https://github.com/pacocoursey/cmdk/issues/171
   */
  selectFirstItem?: boolean;
  /** Allow user to create option when there is no option matched. */
  creatable?: boolean;
  /** Props of `Command` */
  commandProps?: React.ComponentPropsWithoutRef<typeof CommandSH>;
  /** Props of `CommandInput` */
  inputProps?: Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
    'value' | 'placeholder' | 'disabled'
  >;
}

export interface MultipleSelectorRef {
  selectedValue: MultipleSelectorOptionSH[];
  input: HTMLInputElement;
}

function transToGroupOption(options: MultipleSelectorOptionSH[], groupBy?: string) {
  if (options.length === 0) {
    return {};
  }
  if (!groupBy) {
    return {
      '': options,
    };
  }

  const groupOption: GroupOption = {};
  options.forEach((option) => {
    const key = (option[groupBy] as string) || '';
    if (!groupOption[key]) {
      groupOption[key] = [];
    }
    groupOption[key].push(option);
  });
  return groupOption;
}

function removePickedOption(groupOption: GroupOption, picked: MultipleSelectorOptionSH[]) {
  const cloneOption = structuredClone(groupOption);

  // eslint-disable-next-line no-restricted-syntax
  for (const [key, value] of Object.entries(cloneOption)) {
    cloneOption[key] = value.filter((val) => !picked.find((p) => p.value === val.value));
  }
  return cloneOption;
}

function isOptionsExist(groupOption: GroupOption, targetOption: MultipleSelectorOptionSH[]) {
  // eslint-disable-next-line no-restricted-syntax
  for (const [, value] of Object.entries(groupOption)) {
    if (value.some((option) => targetOption.find((p) => p.value === option.value))) {
      return true;
    }
  }
  return false;
}

/**
 * The `CommandEmpty` of shadcn/ui will cause the cmdk empty not rendering correctly.
 * So we create one and copy the `Empty` implementation from `cmdk`.
 *
 * @reference: https://github.com/hsuanyi-chou/shadcn-ui-expansions/issues/34#issuecomment-1949561607
 * */
const CommandEmpty = forwardRef<HTMLDivElement, React.ComponentProps<typeof CommandPrimitive.Empty>>(
  ({ className, ...props }, forwardedRef) => {
    const render = useCommandState((state) => state.filtered.count === 0);

    if (!render) return null;

    return (
      <div
        ref={forwardedRef}
        className={cn('py-6 text-center text-sm', className)}
        cmdk-empty=""
        role="presentation"
        {...props}
      />
    );
  },
);

CommandEmpty.displayName = 'CommandEmpty';

const MultipleSelector = React.forwardRef<MultipleSelectorRef, MultipleSelectorProps>(
  (
    {
      showRemoveIconInBadge = true,
      value,
      onChange,
      placeholder,
      defaultOptions: arrayDefaultOptions = [],
      options: arrayOptions,
      delay,
      onSearch,
      loadingIndicator,
      emptyIndicator,
      maxSelected = Number.MAX_SAFE_INTEGER,
      onMaxSelected,
      hidePlaceholderWhenSelected,
      disabled,
      groupBy,
      className,
      badgeClassName,
      selectFirstItem = true,
      creatable = false,
      triggerSearchOnFocus = false,
      commandProps,
      inputProps,
      variant = 'default',
    }: MultipleSelectorProps,
    ref: React.Ref<MultipleSelectorRef>,
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const [selected, setSelected] = React.useState<MultipleSelectorOptionSH[]>(value || []);
    const [options, setOptions] = React.useState<GroupOption>(transToGroupOption(arrayDefaultOptions, groupBy));
    const [inputValue, setInputValue] = React.useState('');
    const [debouncedSearchTerm] = useDebounceValue(inputValue, delay || 500);

    React.useImperativeHandle(
      ref,
      () => ({
        selectedValue: [...selected],
        input: inputRef.current as HTMLInputElement,
        focus: () => inputRef.current?.focus(),
      }),
      [selected],
    );

    const handleUnselect = React.useCallback(
      (option: MultipleSelectorOptionSH) => {
        const newOptions = selected.filter((s) => s.value !== option.value);
        setSelected(newOptions);
        onChange?.(newOptions);
      },
      [onChange, selected],
    );

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current;
        if (input) {
          if (e.key === 'Delete' || e.key === 'Backspace') {
            if (input.value === '' && selected.length > 0) {
              handleUnselect(selected[selected.length - 1]);
            }
          }
          // This is not a default behavior of the <input /> field
          if (e.key === 'Escape') {
            input.blur();
          }
        }
      },
      [handleUnselect, selected],
    );

    useEffect(() => {
      if (value) {
        setSelected(value);
      }
    }, [value]);

    useEffect(() => {
      /** If `onSearch` is provided, do not trigger options updated. */
      if (!arrayOptions || onSearch) {
        return;
      }
      const newOption = transToGroupOption(arrayOptions || [], groupBy);
      if (JSON.stringify(newOption) !== JSON.stringify(options)) {
        setOptions(newOption);
      }
    }, [arrayDefaultOptions, arrayOptions, groupBy, onSearch, options]);

    useEffect(() => {
      const doSearch = async () => {
        setIsLoading(true);
        const res = await onSearch?.(debouncedSearchTerm);
        setOptions(transToGroupOption(res || [], groupBy));
        setIsLoading(false);
      };

      const exec = async () => {
        if (!onSearch || !open) return;

        if (triggerSearchOnFocus) {
          await doSearch();
        }

        if (debouncedSearchTerm) {
          await doSearch();
        }
      };

      // eslint-disable-next-line no-void
      void exec();
    }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus]);

    const CreatableItem = () => {
      if (!creatable) return undefined;
      if (
        isOptionsExist(options, [{ value: inputValue, label: inputValue }]) ||
        selected.find((s) => s.value === inputValue)
      ) {
        return undefined;
      }

      const Item = (
        <CommandItem
          value={inputValue}
          className="cursor-pointer"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onSelect={(value: string) => {
            if (selected.length >= maxSelected) {
              onMaxSelected?.(selected.length);
              return;
            }
            setInputValue('');
            const newOptions = [...selected, { value, label: value }];
            setSelected(newOptions);
            onChange?.(newOptions);
          }}
        >
          {`Create "${inputValue}"`}
        </CommandItem>
      );

      // For normal creatable
      if (!onSearch && inputValue.length > 0) {
        return Item;
      }

      // For async search creatable. avoid showing creatable item before loading at first.
      if (onSearch && debouncedSearchTerm.length > 0 && !isLoading) {
        return Item;
      }

      return undefined;
    };

    const EmptyItem = React.useCallback(() => {
      if (!emptyIndicator) return undefined;

      // For async search that showing emptyIndicator
      if (onSearch && !creatable && Object.keys(options).length === 0) {
        return (
          <CommandItem
            value="-"
            disabled
          >
            {emptyIndicator}
          </CommandItem>
        );
      }

      return <CommandEmpty>{emptyIndicator}</CommandEmpty>;
    }, [creatable, emptyIndicator, onSearch, options]);

    const selectables = React.useMemo<GroupOption>(() => removePickedOption(options, selected), [options, selected]);

    /** Avoid Creatable Selector freezing or lagging when paste a long string. */
    const commandFilter = React.useCallback(() => {
      if (commandProps?.filter) {
        return commandProps.filter;
      }

      if (creatable) {
        return (value: string, search: string) => (value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1);
      }
      // Using default filter in `cmdk`. We don't have to provide it.
      return undefined;
    }, [creatable, commandProps?.filter]);

    return (
      <CommandSH
        {...commandProps}
        onKeyDown={(e) => {
          handleKeyDown(e);
          commandProps?.onKeyDown?.(e);
        }}
        className={cn(
          'overflow-visible',
          variant === 'default' ? 'bg-accent text-secondary' : 'bg-muted text-secondary',
          commandProps?.className,
        )}
        shouldFilter={commandProps?.shouldFilter !== undefined ? commandProps.shouldFilter : !onSearch} // When onSearch is provided, we don't want to filter the options. You can still override it.
        filter={commandFilter()}
      >
        <div
          className={cn(
            'group rounded-md p-[8px] px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
            variant === 'default' ? 'bg-muted text-secondary' : '',
            className,
          )}
        >
          <div className="flex flex-wrap gap-1">
            {selected.map((option) => (
              <BadgeSH
                key={option.value}
                className={cn(
                  'data-[disabled]:bg-muted-foreground data-[disabled]:text-muted data-[disabled]:hover:bg-muted-foreground',
                  'data-[fixed]:bg-muted-foreground data-[fixed]:text-muted data-[fixed]:hover:bg-muted-foreground',
                  badgeClassName,
                )}
                data-fixed={option.fixed}
                data-disabled={disabled ? true : undefined}
              >
                {option.label}
                {showRemoveIconInBadge && (
                  <button
                    className={cn(
                      'ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2',
                      (disabled || option.fixed) && 'hidden',
                    )}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUnselect(option);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => handleUnselect(option)}
                  >
                    <X
                      className={
                        variant === 'default'
                          ? 'h-3 w-3 text-secondary hover:bg-muted-foreground'
                          : 'h-3 w-3 text-secondary '
                      }
                    />
                  </button>
                )}
              </BadgeSH>
            ))}
            {/* Avoid having the "Search" Icon */}
            <CommandPrimitive.Input
              {...inputProps}
              ref={inputRef}
              value={inputValue}
              disabled={disabled}
              onValueChange={(value) => {
                setInputValue(value);
                inputProps?.onValueChange?.(value);
              }}
              onBlur={(event) => {
                setOpen(false);
                inputProps?.onBlur?.(event);
              }}
              onFocus={async (event) => {
                setOpen(true);
                triggerSearchOnFocus && (await onSearch?.(debouncedSearchTerm));
                inputProps?.onFocus?.(event);
              }}
              placeholder={hidePlaceholderWhenSelected && selected.length !== 0 ? '' : placeholder}
              className={cn(
                'ml-2 flex-1 outline-none placeholder:text-muted-foreground',
                variant === 'default'
                  ? 'bg-accent text-secondary placeholder:text-secondary'
                  : 'bg-muted text-secondary placeholder:text-secondary',
                inputProps?.className,
              )}
            />
          </div>
        </div>
        <div className="relative">
          {open && (
            <CommandList
              className={cn(
                'absolute top-0 z-50 max-h-28 w-full overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in scrollbar-thin',
                variant === 'default' ? 'bg-accent text-secondary' : 'bg-muted',
              )}
            >
              {isLoading ? (
                <>{loadingIndicator}</>
              ) : (
                <>
                  {EmptyItem()}
                  {CreatableItem()}
                  {!selectFirstItem && (
                    <CommandItem
                      value="-"
                      className="hidden"
                    />
                  )}
                  {Object.entries(selectables).map(([key, dropdowns]) => (
                    <CommandGroup
                      key={key}
                      heading={key}
                      className={variant === 'default' ? 'h-full overflow-auto text-secondary' : 'h-full overflow-auto'}
                    >
                      <>
                        {dropdowns.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            disabled={option.disable}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onSelect={() => {
                              if (selected.length >= maxSelected) {
                                onMaxSelected?.(selected.length);
                                return;
                              }
                              setInputValue('');
                              const newOptions = [...selected, option];
                              setSelected(newOptions);
                              onChange?.(newOptions);
                            }}
                            className={cn(
                              'cursor-pointer',
                              variant === 'default'
                                ? 'bg-accent text-secondary hover:bg-accent-light hover:text-secondary'
                                : 'bg-muted text-secondary hover:bg-muted-light hover:text-secondary',
                              option.disable &&
                                (variant === 'default'
                                  ? 'cursor-default text-muted-foreground hover:bg-accent hover:text-muted-foreground'
                                  : 'cursor-default text-gray-500 hover:bg-muted hover:text-gray-500'),
                            )}
                          >
                            {option.label}
                          </CommandItem>
                        ))}
                      </>
                    </CommandGroup>
                  ))}
                </>
              )}
            </CommandList>
          )}
        </div>
      </CommandSH>
    );
  },
);

MultipleSelector.displayName = 'MultipleSelector';
export default MultipleSelector;
