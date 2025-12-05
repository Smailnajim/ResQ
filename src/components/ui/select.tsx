import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: { value: string; label: string }[];
}

function Select({ className, options, ...props }: SelectProps) {
    return (
        <select
            data-slot="select"
            className={cn(
                "h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none cursor-pointer",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                "dark:bg-input/30",
                className
            )}
            {...props}
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    )
}

export { Select }
