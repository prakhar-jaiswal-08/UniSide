"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LucideIcon } from "lucide-react";

export type DropdownOption = {
  value: string;
  label: string;
  icon?: LucideIcon;
};

type DropdownProps = {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  width?: string;
};

export default function Dropdown({
  value,
  options,
  onChange,
  placeholder,
  width = "w-56",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected =
    options.find((option) => option.value === value) ?? null;

  return (
    <div
      ref={containerRef}
      className={`relative ${width}`}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white transition hover:border-zinc-600"
      >
        <div className="flex items-center gap-2">
          {selected?.icon && <selected.icon size={18} />}

          <span className="font-semibold text-white">
  {selected?.label || "Search All"}
</span>
        </div>

        <ChevronDown
          size={18}
          className={`transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-2 w-full overflow-hidden rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-zinc-800 ${
                option.value === value
                  ? "bg-zinc-800 text-blue-400"
                  : "text-white"
              }`}
            >
              {option.icon && (
                <option.icon size={18} />
              )}

              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}