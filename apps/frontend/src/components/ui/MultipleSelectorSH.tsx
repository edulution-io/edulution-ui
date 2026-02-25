/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

'use client';

/* eslint-disable react/no-unknown-property, react/no-unstable-nested-components, @typescript-eslint/no-shadow, react/button-has-type, @typescript-eslint/no-unused-expressions, react/jsx-no-useless-fragment */

import * as React from 'react';
import { forwardRef, useCallback, useEffect, useRef } from 'react';
import { Command as CommandPrimitive, useCommandState } from 'cmdk';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '@edulution-io/ui-kit';
import { BadgeSH } from '@/components/ui/BadgeSH';
import { CommandGroup, CommandItem, CommandList, CommandSH } from '@/components/ui/CommandSH';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';
import { useDebounceValue } from 'usehooks-ts';
import useMedia from '@/hooks/useMedia';
import { VARIANT_COLORS } from '@libs/ui/constants/commonClassNames';

const MULTIPLE_SELECTOR_BASE_CLASSES =
  'w-full rounded-lg px-3 text-p transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 flex flex-wrap items-center gap-1';

const variantClasses = {
  default: VARIANT_COLORS.default,
  dialog: VARIANT_COLORS.dialog,
} as const;

const optionVariantClasses = {
  default: {
    base: 'text-background hover:bg-muted',
    disabled: 'cursor-default text-muted-foreground hover:bg-white hover:dark:bg-accent',
  },
  dialog: {
    base: 'text-background hover:bg-muted-light',
    disabled: 'cursor-default text-muted-foreground hover:bg-white hover:dark:bg-muted',
  },
} as const;

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
  onSearch?: (value: string) => Promise<MultipleSelectorOptionSH[]> | MultipleSelectorOptionSH[];
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
        className={cn('py-6 text-center text-p', className)}
        cmdk-empty=""
        role="presentation"
        {...props}
      />
    );
  },
);

CommandEmpty.displayName = 'CommandEmpty';

const MultipleSelectorSH = React.forwardRef<MultipleSelectorRef, MultipleSelectorProps>(
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
      selectFirstItem = true,
      creatable = false,
      triggerSearchOnFocus = false,
      commandProps,
      inputProps,
      variant = 'default',
    }: MultipleSelectorProps,
    ref: React.Ref<MultipleSelectorRef>,
  ) => {
    const { isMobileView, isTabletView } = useMedia();
    const inputRef = useRef<HTMLInputElement>(null);
    const triggerRef = useRef<HTMLDivElement>(null);
    const popoverContentRef = useRef<HTMLDivElement>(null);
    const touchStartY = useRef<number>(0);
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

    const totalItemCount = React.useMemo(
      () => Object.values(selectables).reduce((total, items) => total + items.length, 0),
      [selectables],
    );

    /** Avoid Creatable Selector freezing or lagging when paste a long string. */
    const commandFilter = useCallback(() => {
      if (commandProps?.filter) {
        return commandProps.filter;
      }

      if (creatable) {
        return (value: string, search: string) => (value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1);
      }
      return undefined;
    }, [creatable, commandProps?.filter]);

    const handleOpenChange = useCallback(
      (isOpen: boolean) => {
        if (!isOpen) {
          setOpen(false);
        }
      },
      [setOpen],
    );

    const handlePopoverInteraction = useCallback((e: Event) => {
      const target = e.target as HTMLElement;

      if (popoverContentRef.current?.contains(target)) {
        return;
      }

      e.preventDefault();
    }, []);

    return (
      <PopoverPrimitive.Root
        open={open}
        onOpenChange={handleOpenChange}
      >
        <CommandSH
          {...commandProps}
          onKeyDown={(e) => {
            handleKeyDown(e);
            commandProps?.onKeyDown?.(e);
          }}
          className={cn('overflow-visible rounded-lg border-0 bg-transparent', commandProps?.className)}
          shouldFilter={commandProps?.shouldFilter !== undefined ? commandProps.shouldFilter : !onSearch}
          filter={commandFilter()}
        >
          <PopoverPrimitive.Anchor asChild>
            <div
              ref={triggerRef}
              className={cn(
                MULTIPLE_SELECTOR_BASE_CLASSES,
                variantClasses[variant],
                selected.length === 0 ? 'h-10' : 'py-1',
                className,
              )}
            >
              {selected.map((option) => (
                <BadgeSH
                  key={option.value}
                  variant="default"
                  data-fixed={option.fixed}
                  data-disabled={disabled ? true : undefined}
                >
                  {option.label}
                  {showRemoveIconInBadge && (
                    <button
                      className={cn('ml-1 rounded-full outline-none', (disabled || option.fixed) && 'hidden')}
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
                      <FontAwesomeIcon
                        icon={faClose}
                        className="h-3 w-3"
                      />
                    </button>
                  )}
                </BadgeSH>
              ))}
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
                  setTimeout(() => {
                    const isClickingPopover = popoverContentRef.current?.contains(document.activeElement);
                    if (!isClickingPopover) {
                      setOpen(false);
                    }
                  }, 0);
                  inputProps?.onBlur?.(event);
                }}
                onFocus={async (event) => {
                  setOpen(true);
                  triggerSearchOnFocus && (await onSearch?.(debouncedSearchTerm));
                  inputProps?.onFocus?.(event);
                }}
                placeholder={hidePlaceholderWhenSelected && selected.length !== 0 ? '' : placeholder}
                className={cn(
                  'flex-1 bg-transparent outline-none placeholder:text-muted-foreground',
                  inputProps?.className,
                )}
              />
            </div>
          </PopoverPrimitive.Anchor>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              ref={popoverContentRef}
              align="start"
              sideOffset={4}
              onOpenAutoFocus={(e) => e.preventDefault()}
              onInteractOutside={handlePopoverInteraction}
              onPointerDownOutside={handlePopoverInteraction}
              className="z-50 w-[var(--radix-popover-trigger-width)] outline-none"
            >
              {open && (
                <CommandList
                  onWheel={(e) => {
                    e.currentTarget.scrollTop += e.deltaY;
                    e.preventDefault();
                  }}
                  onTouchStart={(e) => {
                    touchStartY.current = e.touches[0].clientY;
                  }}
                  onTouchMove={(e) => {
                    const touchY = e.touches[0].clientY;
                    const deltaY = touchStartY.current - touchY;
                    e.currentTarget.scrollTop += deltaY;
                    touchStartY.current = touchY;
                  }}
                  className={cn(
                    'w-full overflow-y-auto rounded-lg text-p outline-none animate-in scrollbar-thin',
                    variantClasses[variant],
                    totalItemCount > 5 && (isMobileView || isTabletView) && 'pb-32',
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
                          className="h-full overflow-auto"
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
                                  option.disable
                                    ? optionVariantClasses[variant].disabled
                                    : optionVariantClasses[variant].base,
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
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </CommandSH>
      </PopoverPrimitive.Root>
    );
  },
);

MultipleSelectorSH.displayName = 'MultipleSelector';
export default MultipleSelectorSH;
