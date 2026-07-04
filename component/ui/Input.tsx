import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  className = "",
  ...props
}: InputProps) {
  return (
    <input
      {...props}
      className={`
        w-full
        rounded-lg
        border
        border-zinc-700
        bg-zinc-800
        p-3
        text-white
        placeholder:text-gray-500
        focus:border-blue-500
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        ${className}
      `}
    />
  );
}