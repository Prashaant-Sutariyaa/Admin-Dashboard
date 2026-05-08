import { useState, useRef, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { Calendar } from 'src/components/ui/calendar';
import { CalendarIcon, X } from 'lucide-react';

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const DateRangePicker = ({
  value,
  onChange,
  placeholder = 'Select date range',
  disabled = false,
  className = '',
}: DateRangePickerProps) => {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState<DateRange | undefined>(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // sync external value
  useEffect(() => {
    setInternal(value);
  }, [value]);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (range: DateRange | undefined) => {
    setInternal(range); // ✅ always update internal for visual feedback

    // ✅ only notify parent when BOTH dates selected or cleared
    // this prevents from_date firing before user picks to_date
    if (!range || (range.from && range.to)) {
      onChange?.(range);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternal(undefined);
    onChange?.(undefined); // ✅ clearing is always safe to notify parent
  };

  // ✅ internal clear (inside calendar header)
  const handleInternalClear = () => {
    setInternal(undefined);
    onChange?.(undefined);
  };

  const displayValue = internal?.from
    ? internal.to
      ? `${formatDate(internal.from)} — ${formatDate(internal.to)}`
      : `${formatDate(internal.from)} — ...`
    : '';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>

      {/* Input trigger */}
      <div
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`
          flex items-center gap-2 min-h-10 w-full
          rounded-md border border-input bg-transparent
          px-3 py-2 text-sm shadow-sm
          transition-colors cursor-pointer select-none
          ${open ? 'border-primary ring-1 ring-ring' : 'hover:border-primary'}
          ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        `}
      >
        <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />

        <span className={`flex-1 ${displayValue ? 'text-foreground' : 'text-muted-foreground'}`}>
          {displayValue || placeholder}
        </span>

        {internal?.from && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded shrink-0"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Calendar dropdown */}
      {open && (
        <div
          className="absolute z-50 mt-1 rounded-md border border-border bg-popover shadow-md"
          style={{ minWidth: 'max-content' }}
        >
          {/* Header hint */}
          <div className="px-4 pt-3 pb-1 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {!internal?.from
                ? 'Select start date'
                : !internal?.to
                  ? 'Now select end date'
                  : 'Range selected'}
            </span>
            {internal?.from && (
              <button
                type="button"
                onClick={handleInternalClear}
                className="text-xs text-muted-foreground hover:text-error transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <Calendar
            mode="range"
            selected={internal}
            onSelect={handleSelect}
            numberOfMonths={2}
            defaultMonth={internal?.from}
          />

          {/* Footer */}
          {internal?.from && internal?.to && (
            <div className="px-4 py-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {Math.round(
                  (internal.to.getTime() - internal.from.getTime()) / (1000 * 60 * 60 * 24)
                )}{' '}
                days selected
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Done
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;