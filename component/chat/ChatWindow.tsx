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
    <div
  className="
    flex-1
    overflow-y-auto
    px-8
    py-6
    space-y-4
    bg-[#0b141a]
    bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.03),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.02),transparent_35%)]
  "
>
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