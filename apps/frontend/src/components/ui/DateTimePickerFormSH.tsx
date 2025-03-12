"use client";

// import { z } from 'zod';
// import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
// import { useForm } from 'react-hook-form';
import { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import styles from './DropdownSelect/dropdownselect.module.scss';

import { CalendarIcon } from '@radix-ui/react-icons';
import cn from '@libs/common/utils/className';
import { ButtonSH } from '@/components/ui/ButtonSH';
import { Calendar } from '@/components/ui/Calendar';
import {
  Form,
  FormControl,
  FormFieldSH,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover';
import { ScrollArea, ScrollBar } from '@/components/ui/ScrollArea';

interface DateTimePickerFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  path: Path<T>;
  variant?: DropdownVariant;
  translationId?: string;
}

const DateTimePickerForm = <T extends FieldValues> (props: DateTimePickerFormProps<T>) => {
  const { form, path, variant, translationId } = props;

  const { t } = useTranslation();

  function handleDateSelect(date: Date | undefined) {
    if (!date) {
      form.setValue(path, date as PathValue<T, Path<T>>);
      return;
    }

    const currentDate = form.getValues(path) || new Date();
    let newDate = new Date(currentDate);

    newDate.setDate(date.getDate());
    newDate.setMonth(date.getMonth());
    newDate.setFullYear(date.getFullYear());

    form.setValue(path, newDate as PathValue<T, Path<T>>);
  }

  function handleTimeChange(type: "hour" | "minute" | "ampm", value: string) {
    const currentDate = form.getValues(path) || new Date();
    let newDate = new Date(currentDate);

    if (type === "hour") {
      const hour = parseInt(value, 10);
      newDate.setHours(newDate.getHours() >= 12 ? hour + 12 : hour);
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value, 10));
    } else if (type === "ampm") {
      const hours = newDate.getHours();
      if (value === "AM" && hours >= 12) {
        newDate.setHours(hours - 12);
      } else if (value === "PM" && hours < 12) {
        newDate.setHours(hours + 12);
      }
    }

    form.setValue(path, newDate as PathValue<T, Path<T>>);
  }

  return (
    <Form {...form}>
      <FormFieldSH
        control={form.control}
        name={path}
        render={({ field }) => (
          <FormItem className="flex flex-col h-8 mb-6">
            { translationId ? <FormLabel className="text-m font-bold text-background">{t(translationId)}</FormLabel> : null }
            <Popover>
              <PopoverTrigger asChild
                className="bg-accent text-input"
              >
                <FormControl className="w-full pl-3 text-left font-normal">
                  <ButtonSH
                    variant={"outline"}
                    className={cn("w-full pl-3 text-left font-normal",
                      { "text-muted-foreground": !field.value }
                    )}
                  >
                    {field.value ? (
                      format(field.value, "MM/dd/yyyy hh:mm aa")
                    ) : (
                      <span>MM/DD/YYYY hh:mm aa</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </ButtonSH>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="bg-overlay" >
                <div className="bg-overlay text-input sm:flex">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                  <div className="bg-overlay flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                    <div className="text-input w-64 overflow-y-auto scrollbar-thin sm:w-auto">
                      <div className="flex sm:flex-col p-2">
                        {Array.from({ length: 24 }, (_, i) => i + 1)
                          .reverse()
                          .map((hour) => (
                            <ButtonSH
                              key={hour}
                              size="icon"
                              variant={
                                field.value &&
                                field.value.getHours() % 12 === hour % 12
                                  ? "default"
                                  : "ghost"
                              }
                              className="sm:w-full shrink-0 aspect-square"
                              onClick={() =>
                                handleTimeChange("hour", hour.toString())
                              }
                            >
                              {hour}
                            </ButtonSH>
                          ))}
                      </div>
                    </div>
                    <ScrollArea className="text-input overflow-y-auto scrollbar-thin w-64 sm:w-auto">
                      <div className="flex sm:flex-col p-2">
                        {Array.from({ length: 12 }, (_, i) => i * 5).map(
                          (minute) => (
                            <ButtonSH
                              key={minute}
                              size="icon"
                              variant={
                                field.value &&
                                field.value.getMinutes() === minute
                                  ? "default"
                                  : "ghost"
                              }
                              className="sm:w-full shrink-0 aspect-square"
                              onClick={() =>
                                handleTimeChange("minute", minute.toString())
                              }
                            >
                              {minute.toString().padStart(2, "0")}
                            </ButtonSH>
                          )
                        )}
                      </div>
                      <ScrollBar
                        orientation="horizontal"
                        className="sm:hidden"
                      />
                    </ScrollArea>
                    <ScrollArea className="text-input bg-overlay">
                      <div className="flex sm:flex-col p-2">
                        {["AM", "PM"].map((ampm) => (
                          <ButtonSH
                            key={ampm}
                            size="icon"
                            variant={
                              field.value &&
                              ((ampm === "AM" &&
                                  field.value.getHours() < 12) ||
                                (ampm === "PM" &&
                                  field.value.getHours() >= 12))
                                ? "default"
                                : "ghost"
                            }
                            className="sm:w-full shrink-0 aspect-square"
                            onClick={() => handleTimeChange("ampm", ampm)}
                          >
                            {ampm}
                          </ButtonSH>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
}

export default DateTimePickerForm;
