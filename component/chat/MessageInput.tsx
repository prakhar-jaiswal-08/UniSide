"use client";

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
    <div className="border-t border-zinc-800 bg-zinc-900 p-4">
      <div className="flex items-center gap-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSend();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder:text-gray-500 focus:border-blue-500 focus:outline-none"
        />

        <button
          onClick={onSend}
          className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
}