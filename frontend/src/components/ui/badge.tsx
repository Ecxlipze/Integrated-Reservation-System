import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Broadsheet tags: 1.5px radius, tinted from the ramps — a light step for the
// fill and the matching dark step for the text on it.
const badgeVariants = cva(
  "group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-[1.5px] border border-transparent px-2.5 py-[3px] text-[11px] tracking-[0.02em] whitespace-nowrap transition-colors [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        // .tag-accent — the default status tag
        default: "bg-cyan-100 text-cyan-800",
        // .tag-neutral
        secondary: "bg-ink-100 text-ink-800",
        // .tag-accent-2 — the rarer magenta second spot
        destructive: "bg-magenta-100 text-magenta-800",
        // .tag-outline
        outline: "border-primary text-primary",
        ghost: "text-ink-800 hover:bg-ink-100",
        link: "text-primary underline-offset-[3px] hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
