import type { AnchorHTMLAttributes, ReactNode } from "react";
import { ActionIcon, type ActionIconName } from "./action-icon";
import { NavLink } from "@/components/pixel";
import {
  pixelButtonVariants,
  type PixelButtonVariant,
} from "@/components/ui/pixel-primitives";

type ButtonLinkProps = {
  icon?: ActionIconName;
  variant?: PixelButtonVariant;
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
  href: string;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  children,
  icon,
  href,
  ...props
}: ButtonLinkProps) {
  return (
    <NavLink
      href={href}
      className={`pixel-button inline-flex items-center justify-center gap-2 border-2 font-semibold transition-[background-color,color,transform,box-shadow] duration-100 ease-[steps(2,end)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${size === "sm" ? "min-h-12 px-3 py-2 text-[10px]" : "min-h-12 px-4 py-2 text-xs"} ${pixelButtonVariants[variant]} ${className}`}
      {...props}
    >
      {icon ? <ActionIcon name={icon} size={size === "sm" ? 14 : 16} /> : null}
      {children}
    </NavLink>
  );
}
