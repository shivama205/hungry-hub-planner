import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30",
        destructive: "bg-primary-600 text-primary-foreground shadow-lg shadow-primary-600/20 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/30",
        outline: "border border-secondary/20 bg-background/50 backdrop-blur-sm hover:bg-secondary/10 hover:border-secondary/30 hover:text-secondary-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/20 hover:bg-secondary/90 hover:shadow-xl hover:shadow-secondary/30",
        ghost: "hover:bg-accent/20 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "bg-accent/10 backdrop-blur-md border border-accent/20 text-primary hover:bg-accent/20 hover:border-accent/30 shadow-glass",
        "glass-primary": "bg-primary/10 backdrop-blur-md border border-primary/20 text-primary hover:bg-primary/20 hover:border-primary/30 shadow-glass",
        "glass-secondary": "bg-secondary/10 backdrop-blur-md border border-secondary/20 text-secondary hover:bg-secondary/20 hover:border-secondary/30 shadow-glass",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
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
