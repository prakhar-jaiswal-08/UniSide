import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export default function Card({
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={`
        rounded-xl
        border
        border-zinc-800
        bg-zinc-900
        shadow-lg
        ${className}
      `}
    >
      {children}
    </div>
  );
}