'use client';

import React, { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket.config";
import { GetUrl, UploadFile } from "@/lib/UploadFile";



export default function Chats({
  group,
  oldMessages,
  chatUser,
}: {
  group: GroupChatType;
  oldMessages: Array<MessageType> | [];
  chatUser?: GroupChatUserType;
}) {
  const [message, setMessage] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [mediaKey, setMediaKey] = useState("");
  const [messages, setMessages] = useState<Array<MessageType>>(oldMessages);
  const [resolvedUrls, setResolvedUrls] = useState<{ [key: string]: string }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef(getSocket());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    
    const socket = socketRef.current;
    socket.auth = {
      room: group.id,
      userId: "123",
    };
    if (!socket.connected) {
      socket.connect();
    }

    const handleMessage = async (data: MessageType) => {
      if (data.mediaUrl) {
        const {signedUrl} = await GetUrl(data.mediaUrl);
        setResolvedUrls((prev) => ({ ...prev, [data.mediaUrl!]: signedUrl }));
      }
      setMessages((prev) => [data, ...prev]);
      scrollToBottom();
    };

    socket.on("message", handleMessage);
    return () =>{
       socket.off("message", handleMessage);
      }
  }, [group.id]);

  useEffect(() => {
    // Resolve signed URLs for existing messages on load
    oldMessages.forEach(async (msg) => {
      if (msg.mediaUrl && !resolvedUrls[msg.mediaUrl]) {
        const {signedUrl} = await GetUrl(msg.mediaUrl);
        console.log(signedUrl)
        setResolvedUrls((prev) => ({ ...prev, [msg.mediaUrl!]: signedUrl }));
      }
    });
  }, [oldMessages]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload: MessageType = {
      message,
      name: chatUser?.name ?? "Unknown",
      created_at: new Date().toISOString(),
      group_id: group.id,
      ...(mediaUrl && { mediaUrl }),
      ...(mediaType && { mediaType }),
    };

    if (mediaUrl) {
      const {signedUrl} = await GetUrl(mediaUrl);
      setResolvedUrls((prev) => ({ ...prev, [mediaUrl]: signedUrl }));
    }

    socketRef.current.emit("message", payload);
    setMessage("");
    setMediaUrl("");
    setMediaType("");
    setMediaKey("");
    setMessages((prev) => [payload, ...prev]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { fileUrl, key } = await UploadFile(file);
    console.log(fileUrl);
    setMediaUrl(fileUrl);
    setMediaType(file.type);
    setMediaKey(key);
  };

  return (
    <div className="flex flex-col h-[94vh] p-4">
      <div className="flex-1 overflow-y-auto flex flex-col-reverse">
        <div ref={messagesEndRef} />
        <div className="flex flex-col gap-2">
          {[...messages].reverse().map((message, i) => {
            const resolvedUrl = message.mediaUrl ? resolvedUrls[message.mediaUrl] : null;

            return (
              <div
                key={message.id ?? i}
                className={`max-w-sm rounded-lg p-2 flex flex-col ${
                  message.name === chatUser?.name
                    ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white self-end"
                    : "bg-gradient-to-r from-gray-200 to-gray-300 text-black self-start"
                }`}
              >
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold">{message.name}</span>
                  <span className="text-gray-300">
                    {new Date(message.created_at).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>

                <div className="text-sm whitespace-pre-wrap">{message.message}</div>

                {resolvedUrl && message.mediaType?.startsWith("video/") && (
                  <video controls className="rounded-lg mt-1 max-w-full">
                    <source src={resolvedUrl} type={message.mediaType} />
                    Your browser does not support the video tag.
                  </video>
                )}

                {resolvedUrl && message.mediaType?.startsWith("image/") && (
                  <img
                    src={resolvedUrl}
                    alt="uploaded"
                    className="rounded-lg mt-1 max-w-full"
                  />
                )}

                {resolvedUrl && message.mediaType?.startsWith("audio/") && (
                  <audio controls className="mt-1">
                    <source src={resolvedUrl} type={message.mediaType} />
                    Your browser does not support the audio tag.
                  </audio>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Send
          </button>
        </div>
        <input
          type="file"
          accept="video/*,audio/*,image/*"
          className="p-2 border rounded-lg"
          onChange={handleFileChange}
        />
      </form>
    </div>
  );
}
