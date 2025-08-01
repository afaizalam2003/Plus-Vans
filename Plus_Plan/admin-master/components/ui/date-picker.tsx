

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function DatePicker({
  className,
  selected,
  onChange,
  ...props
}: {
  className?: string;
  selected: Date | undefined;
  onChange: (date: Date | undefined) => void;
  [key: string]: any;
}) {
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !selected && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selected ? format(selected, 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={onChange}
            initialFocus
            {...props}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function DateRangePicker({
  className,
  startDate,
  endDate,
  onChange,
  ...props
}: {
  className?: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  onChange: (date: { start: Date | undefined; end: Date | undefined }) => void;
  [key: string]: any;
}) {
  const [date, setDate] = React.useState<{
    start: Date | undefined;
    end: Date | undefined;
  }>({ start: startDate, end: endDate });

  React.useEffect(() => {
    onChange(date);
  }, [date, onChange]);

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.start ? (
              date.end ? (
                <>
                  {format(date.start, 'LLL dd, y')} -{' '}
                  {format(date.end, 'LLL dd, y')}
                </>
              ) : (
                format(date.start, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.start}
            selected={date}
            onSelect={(range) => {
              setDate({
                start: range?.start,
                end: range?.end,
              });
            }}
            numberOfMonths={2}
            {...props}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
