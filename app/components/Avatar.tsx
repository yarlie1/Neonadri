import { UserRound } from "lucide-react";

type AvatarProps = {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
  xl: "h-20 w-20",
};

const iconClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-9 w-9",
};

export default function Avatar({
  src,
  name,
  size = "md",
  className = "",
}: AvatarProps) {
  const label = name ? `${name}'s profile photo` : "Profile photo";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-[#111111] bg-white text-[#333333] shadow-none ${sizeClasses[size]} ${className}`}
      aria-label={label}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={label}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <UserRound className={iconClasses[size]} />
      )}
    </span>
  );
}
