import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { getSocket } from "@/lib/socket.config";
import { authOptions, CustomSession } from "@/app/api/auth/[...nextauth]/options"
import { getServerSession } from "next-auth"
import { Input } from "../ui/input";

export default async function Chats({
  group,
  oldMessages,
  chatUser,
}: {
  group: GroupChatType;
  oldMessages: Array<MessageType> | [];
  chatUser?: GroupChatUserType;
}) {
  const session: CustomSession | null = await getServerSession(authOptions);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<MessageType>>(oldMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  let socket = useMemo(() => {
    const socket = getSocket();
    socket.auth = {
      room: group.id,
      userId:session?.user?.id
      
    };
    return socket.connect();
  }, []);
  useEffect(() => {
    socket.on("message", (data: MessageType) => {
      console.log("The message is", data);
      setMessages((prevMessages) => [...prevMessages, data]);
      scrollToBottom();
    });

    return () => {
      socket.close();
    };
  }, []);
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const payload: MessageType = {
      message: message,
      name: chatUser?.name ?? "Unknown",
      created_at: new Date().toISOString(),
      group_id: group.id,
    };
    console.log(payload);
    socket.emit("message", payload);
    setMessage("");
    setMessages([...messages, payload]);
  };

  return (
    <div className="flex flex-col h-[94vh]  p-4">
      <div className="flex-1 overflow-y-auto flex flex-col-reverse">
        <div ref={messagesEndRef} />
        <div className="flex flex-col gap-2">
   {[...messages].reverse().map((message) => (
  <div
    key={message.id}
    className={`max-w-sm rounded-lg p-2 flex flex-col ${
      message.name === chatUser?.name
        ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white self-end"
        : "bg-gradient-to-r from-gray-200 to-gray-300 text-black self-start"
    }`}
  >
    <div className="flex justify-between text-xs mb-1">
      <span className="font-semibold">{message.name}</span>
      <span className="text-gray-300">{new Date(message.created_at).toLocaleTimeString(
"en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
}


      )}</span>
    </div>
    <div className="text-sm">{message.message}</div>
  </div>
))}

        
        </div>
      </div>
      <form onSubmit={handleSubmit} className="mt-2 flex items-center">
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => setMessage(e.target.value)}
        />
      </form>
    </div>
  );
}
