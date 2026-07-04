import MessageBubble from "./MessageBubble";

type Message = {
  id: number;
  sender_id: string;
  message: string;
  created_at: string;
};

type Props = {
  messages: Message[];
  currentUserId: string;
  otherUser: string;
  bottomRef: React.RefObject<HTMLDivElement | null>;
};

export default function ChatWindow({
  messages,
  currentUserId,
  otherUser,
  bottomRef,
}: Props) {
  return (
    <div className="flex-1 overflow-y-auto bg-[rgb(17,27,33)] px-6 py-5 space-y-3">
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center text-center text-zinc-400">
          <div className="mb-4 text-6xl">💬</div>

          <h2 className="text-xl font-semibold text-white">
            Start the conversation
          </h2>

          <p className="mt-2">
            Send your first message.
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isMine={message.sender_id === currentUserId}
            otherUser={otherUser}
          />
        ))
      )}

      <div ref={bottomRef} />
    </div>
  );
}