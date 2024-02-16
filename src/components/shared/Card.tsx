import React from "react";
import { cn } from "@/lib/utils";
import {
  Card as SHCard,
  CardContent as SHCardContent,
} from "@/components/ui/card";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva("border-4 border-solid", {
  variants: {
    variant: {
      default: "border-[#8CBB64]",
      primary: "border-[#3E76AC]",
      info: "border-[#8CBB64]",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <SHCard
      ref={ref}
      className={cn(
        cardVariants({ variant }),
        "border-4 border-solid",
        className,
      )}
      {...props}
    />
  ),
);

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <SHCardContent ref={ref} className={cn("p-[20px]", className)} {...props} />
));

export { Card, CardContent };
