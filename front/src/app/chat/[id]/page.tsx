
import { fetchChats } from "@/fetch/chatsFetch";
import dynamic from "next/dynamic";

import { fetchChatGroup, fetchChatGroupUsers } from "@/fetch/groupFetch";
import { notFound } from "next/navigation";
import React from "react";
const ChatBase = dynamic(() => import("@/components/chat/ChatBase"), {
  ssr: false,
});

export default async function chat({ params }: { params: { id: string } }) {
  if (params.id.length !== 36) {
    return notFound();
  }
  const chatGroup: GroupChatType | null = await fetchChatGroup(params.id);
  if (chatGroup === null) {
    return notFound();
  }
  const chatGroupUsers: Array<GroupChatUserType> | [] =
    await fetchChatGroupUsers(params?.id);
  const chats: Array<MessageType> | [] = await fetchChats(params.id);

  return (
    <div>
      <ChatBase group={chatGroup} users={chatGroupUsers} oldMessages={chats} />
    </div>
  );
}
