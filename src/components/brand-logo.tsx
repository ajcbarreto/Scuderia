import Image from "next/image";
import { cn } from "@/lib/utils";

/** Ficheiro em `public/logo-scuderia.png` */
const LOGO = "/logo-scuderia.png";
const NATURAL_W = 496;
const NATURAL_H = 85;

const sizeClass = {
  sm: "h-6",
  md: "h-7 sm:h-8",
  lg: "h-8 sm:h-9 md:h-10",
} as const;

type BrandLogoProps = {
  className?: string;
  size?: keyof typeof sizeClass;
  /** usar no header (above the fold) */
  priority?: boolean;
};

export function BrandLogo({
  className,
  size = "md",
  priority = false,
}: BrandLogoProps) {
  return (
    <Image
      src={LOGO}
      width={NATURAL_W}
      height={NATURAL_H}
      unoptimized
      className={cn(
        "block w-auto max-w-[min(280px,calc(100vw-7rem))] object-contain object-left",
        sizeClass[size],
        className,
      )}
      alt="Scuderia itTech"
      priority={priority}
    />
  );
}
