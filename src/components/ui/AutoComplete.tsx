import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

interface Option {
    label: string;
    value: string;
}

interface AutoCompleteProps {
    options: Option[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    emptyMessage?: string;
    disabled?: boolean;
    className?: string;
    clearable?: boolean;
}

const AutoComplete = ({
    options,
    value,
    onChange,
    placeholder = "Search...",
    emptyMessage = "No results found.",
    disabled = false,
    className = "",
    clearable = true,
}: AutoCompleteProps) => {
    const selected = options.find((o) => o.value === value);

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // ✅ Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery("");
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const filtered = query.trim()
        ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
        : options;

    const handleSelect = (opt: Option) => {
        onChange(opt.value);
        setQuery("");
        setOpen(false);
        inputRef.current?.blur();
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
        setQuery("");
        inputRef.current?.focus();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setOpen(true);
    };

    // Show query while typing, selected label when closed
    const inputDisplayValue = open ? query : (selected?.label ?? "");

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>

            {/* Input wrapper */}
            <div
                className={`
          flex items-center min-h-10 w-full
          rounded-md border border-input bg-transparent
          px-3 py-2 text-sm shadow-sm transition-colors
          ${open ? "border-primary ring-1 ring-ring" : "hover:border-primary"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-text"}
        `}
                onClick={() => !disabled && inputRef.current?.focus()}
            >
                <input
                    ref={inputRef}
                    type="text"
                    disabled={disabled}
                    value={inputDisplayValue}
                    onChange={handleInputChange}
                    onFocus={() => !disabled && setOpen(true)}
                    placeholder={selected ? "" : placeholder}
                    className="flex-1 h-full bg-transparent outline-none placeholder:text-muted-foreground text-foreground disabled:cursor-not-allowed min-w-0 py-0"
                />

                <div className="flex items-center gap-1 ml-1 shrink-0">
                    {/* Clear button */}
                    {clearable && selected && !disabled && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                    {/* Chevron */}
                    <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    />
                </div>
            </div>

            {/* Dropdown list */}
            {open && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md overflow-hidden">
                    <ul className="max-h-64 overflow-y-auto py-1">
                        {filtered.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-muted-foreground text-center">
                                {emptyMessage}
                            </li>
                        ) : (
                            filtered.map((o) => (
                                <li
                                    key={o.value}
                                    onMouseDown={(e) => e.preventDefault()} // ✅ prevent blur before select fires
                                    onClick={() => handleSelect(o)}
                                    className={`
                    flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors
                    ${o.value === value
                                            ? "bg-lightprimary text-primary font-medium"
                                            : "hover:bg-muted text-foreground"
                                        }
                  `}
                                >
                                    <span className={`text-xs w-3 shrink-0 ${o.value === value ? "text-primary" : "opacity-0"}`}>
                                        ✓
                                    </span>
                                    {o.label}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}

        </div>
    );
};

export default AutoComplete;