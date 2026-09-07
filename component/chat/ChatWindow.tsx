"use client";

import MessageBubble from "./MessageBubble";
import { MessageCircle } from "lucide-react";

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
      className="flex-1 overflow-y-auto px-4 py-6 sm:px-8"
      style={{
        backgroundColor: "#f1f5f9",
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.68), rgba(255,255,255,0.68)), url('/chat-bg.jpg')",
        backgroundSize: "420px auto",
        backgroundRepeat: "repeat",
      }}
    >
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">
            <MessageCircle
              size={27}
              className="text-gray-400"
            />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-gray-900">
            Start the conversation
          </h2>

          <p className="mt-1.5 text-sm text-gray-500">
            Send your first message to {otherUser}.
          </p>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isMine={
                message.sender_id === currentUserId
              }
              otherUser={otherUser}
            />
          ))}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}