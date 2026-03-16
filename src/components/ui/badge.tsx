import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-badge border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-accent text-white hover:bg-accent-hover",
                secondary:
                    "border-transparent bg-bg-hover text-text-secondary",
                mega:
                    "border-transparent bg-gold text-gold-text text-[0.7rem] uppercase tracking-wide",
                outline: "text-text-primary",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
