type Message = {
  id: number;
  sender_id: string;
  message: string;
  created_at: string;
};

type Props = {
  message: Message;
  isMine: boolean;
  otherUser: string;
};

export default function MessageBubble({
  message,
  isMine,
  otherUser,
}: Props) {
  return (
    <div
      className={`flex w-full items-end gap-3 ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      {!isMine && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-700 font-semibold uppercase text-white">
          {otherUser.charAt(0)}
        </div>
      )}

      <div className="max-w-[65%]">
        <div
          className={`rounded-2xl px-4 py-3 shadow-md ${
            isMine
              ? "rounded-br-md bg-blue-600 text-white"
              : "rounded-bl-md bg-[#202c33] text-white"
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-[15px] leading-6">
            {message.message}
          </p>
        </div>

        <p
          className={`mt-1 text-xs text-zinc-500 ${
            isMine ? "text-right" : "text-left"
          }`}
        >
          {new Date(message.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}