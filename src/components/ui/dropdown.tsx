import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface DropdownProps {
    value: string;
    options: { label: string; value: string }[];
    onChange: (value: string) => void;
    className?: string;
}

export function Dropdown({ value, options, onChange, className }: DropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value) || options[0];

    return (
        <div className={cn("relative z-50", className)} ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-[160px] h-9 px-3 py-2 bg-bg-hover text-sm border border-border rounded-btn text-text-primary focus:outline-none transition-[150ms_ease]"
            >
                <span className="truncate flex-1 text-left">{selectedOption?.label}</span>
                <ChevronDown size={14} className="text-text-secondary ml-2 flex-shrink-0" />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-1 w-[160px] bg-bg-panel border border-border rounded-btn overflow-hidden shadow-lg animate-in fade-in zoom-in-95 duration-150">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className="flex w-full items-center justify-between px-3 py-2 text-sm text-text-primary hover:bg-bg-hover transition-colors"
                        >
                            <span className="truncate">{option.label}</span>
                            {value === option.value && (
                                <Check size={14} className="text-success flex-shrink-0 ml-2" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
