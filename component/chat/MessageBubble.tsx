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
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold uppercase text-gray-700">
          {otherUser.charAt(0)}
        </div>
      )}

      <div className="max-w-[75%] sm:max-w-[65%]">
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isMine
              ? "rounded-br-md bg-gray-900 text-white"
              : "rounded-bl-md border border-gray-200 bg-white text-gray-900 shadow-sm"
          }`}
        >
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {message.message}
          </p>
        </div>

        <p
          className={`mt-1.5 px-1 text-[11px] text-gray-400 ${
            isMine ? "text-right" : "text-left"
          }`}
        >
          {new Date(
            message.created_at
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}