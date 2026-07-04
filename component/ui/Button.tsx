import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white",
    secondary:
      "bg-zinc-800 hover:bg-zinc-700 text-white",
    danger:
      "bg-red-600 hover:bg-red-700 text-white",
  };

  return (
    <button
      {...props}
      className={`
        px-5
        py-3
        rounded-lg
        font-semibold
        transition
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}