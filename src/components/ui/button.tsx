import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-btn text-sm font-semibold ring-offset-bg-base transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transition-[150ms_ease]",
    {
        variants: {
            variant: {
                default: "bg-accent text-white hover:bg-accent-hover",
                destructive: "bg-danger text-white hover:bg-danger/90",
                outline: "border border-border bg-transparent hover:bg-bg-hover text-text-primary",
                secondary: "bg-bg-panel text-text-primary hover:bg-bg-hover",
                ghost: "hover:bg-bg-hover text-text-primary",
                link: "text-accent underline-offset-4 hover:underline",
                icon: "bg-bg-hover rounded-btn p-2 text-text-secondary hover:text-text-primary",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-btn px-3",
                lg: "h-11 rounded-btn px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
