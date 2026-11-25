import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        tertiary:
          "border-transparent bg-tertiary text-tertiary-foreground hover:bg-tertiary/80",
        olive:
          "border-[#D4E0CC] bg-[#EBF1E6] text-[#42522D] dark:bg-[#253322] dark:text-[#A8C29D] dark:border-[#384D34]",
        clay:
          "border-[#EED4C3] bg-[#F7ECE4] text-[#8C4A21] dark:bg-[#3D2517] dark:text-[#E8A57F] dark:border-[#5C3924]",
        wheat:
          "border-[#F2E3C2] bg-[#FAF3E5] text-[#8F681C] dark:bg-[#3B3016] dark:text-[#E6C683] dark:border-[#57461F]",
        forest:
          "border-[#CEE0D4] bg-[#E7EFEA] text-[#1E3B27] dark:bg-[#1A2E20] dark:text-[#9BC2A6] dark:border-[#2C4A35]",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border bg-card/60",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
