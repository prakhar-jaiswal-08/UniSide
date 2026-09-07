"use client";

import { Send } from "lucide-react";

type Props = {
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  onSend: () => void;
};

export default function MessageInput({
  text,
  setText,
  onSend,
}: Props) {
  return (
    <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="mx-auto flex w-full max-w-4xl items-center gap-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Type a message..."
          className="h-11 flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 transition focus:border-gray-500 focus:bg-white focus:ring-2 focus:ring-gray-200"
        />

        <button
          type="button"
          onClick={onSend}
          disabled={!text.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-900 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}