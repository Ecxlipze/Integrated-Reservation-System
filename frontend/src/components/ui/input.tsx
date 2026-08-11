import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // Broadsheet: 36px min-height, 6px/10px padding, 2px radius, surface
        // fill, cyan caret. Focus tightens the border to cyan with no offset
        // rather than drawing a ring outside the field.
        "min-h-9 w-full min-w-0 rounded-[2px] border border-input bg-card px-2.5 py-1.5 font-sans text-sm text-foreground caret-primary transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[color-mix(in_srgb,var(--foreground)_65%,transparent)] placeholder:opacity-100 hover:border-[color-mix(in_srgb,var(--foreground)_45%,transparent)] focus-visible:border-primary focus-visible:outline-offset-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Input }
