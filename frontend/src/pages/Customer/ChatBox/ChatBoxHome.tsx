import { useState, useEffect, useRef } from "react";
import { FaCommentDots } from "react-icons/fa";
import ChatList from "./ChatList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";

import {
  getUserConversations,
  getMessages,
  markMessageAsRead,
} from "../../../services/chats/chatService";

import websocketService from "../../../services/chats/websocketService";
import { tokenService } from "../../../services/auth/tokenService";
import { useAuth } from "../../../context/AuthContext";

const ChatBoxHome = () => {
  const { user, isAuthenticated } = useAuth();
  const currentUserId = user?.userId || null;

  /* ---------- DATA STATE ---------- */
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);

  /* ---------- UI STATE ---------- */
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // FIX 1: Luôn đảm bảo Ref này đồng bộ với selectedChat
  const currentConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const loadConversations = async () => {
    if (!currentUserId) return;
    setLoading(true);
    const res = await getUserConversations(currentUserId);
    if (res.success && Array.isArray(res.data)) {
      const mapped = res.data.map((c: any) => ({
        ...c,
        name: c.conversationTitle || "Người dùng",
        otherPerson:
          c.sender?.userId === currentUserId ? c.recipient : c.sender,
      }));
      setConversations(mapped);
    }
    setLoading(false);
  };

  const loadMessages = async (id: string) => {
    // FIX 2: Gán Ref ngay khi bắt đầu load tin nhắn của hội thoại mới
    currentConversationIdRef.current = id;
    const res = await getMessages(id);
    if (res.success && Array.isArray(res.data)) {
      const transformed = res.data.map((msg: any) => ({
        ...msg,
        sender: msg.senderId === currentUserId ? "user" : "other",
      }));
      setMessages(transformed);
    }
  };

  useEffect(() => {
    if (!user?.userId) return;

    loadConversations();

    const unsubscribe = websocketService.onNewMessage((data: any) => {
      console.log("Nhận tin nhắn mới:", data);
      if (
        String(currentConversationIdRef.current) === String(data.conversationId)
      ) {
        setMessages((prev) => {
          // 1. Lọc bỏ các tin nhắn tạm (temp) và cả tin nhắn thật bị trùng ID
          const filtered = prev.filter(
            (m) =>
              m.messageId !== data.messageId &&
              !(m.messageId.startsWith("temp-") && m.content === data.content),
          );

          // 2. Ép kiểu sender nếu senderId bị null (nếu là mình gửi thì content sẽ khớp)
          // Lưu ý: Đây là cách fix tạm cho lỗi Backend gửi null
          const isMe =
            data.senderId === currentUserId ||
            (data.senderId === null && data.senderName === user?.userName);

          return [
            ...filtered,
            {
              ...data,
              sender: isMe ? "user" : "other",
              senderId: data.senderId || (isMe ? currentUserId : "other-id"), // bù đắp senderId bị null
            },
          ];
        });
      }
      loadConversations();
    });

    return () => {
      unsubscribe();
    };
  }, [currentUserId, isAuthenticated]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !currentUserId) return;

    let recipientId = selectedChat.otherPerson?.userId;

    if (!recipientId || recipientId === currentUserId) {
      if (
        selectedChat.sender?.userId &&
        selectedChat.sender?.userId !== currentUserId
      ) {
        recipientId = selectedChat.sender.userId;
      } else if (
        selectedChat.recipient?.userId &&
        selectedChat.recipient?.userId !== currentUserId
      ) {
        recipientId = selectedChat.recipient.userId;
      }
    }

    if (!recipientId) {
      console.error("Không tìm thấy recipientId hợp lệ!");
      return;
    }

    const content = newMessage.trim();

    const tempMessage = {
      messageId: `temp-${Date.now()}`,
      senderId: currentUserId,
      conversationId: selectedChat.conversationId,
      sender: "user",
      content: content,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    if (websocketService.isConnected()) {
      websocketService.send("/app/chat", {
        senderId: currentUserId,
        recipientId: recipientId,
        content: content,
        conversationId: selectedChat.conversationId,
      });
    }
  };

  const handleChatSelect = async (chat: any) => {
    setSelectedChat(chat);
    currentConversationIdRef.current = chat.conversationId;

    await loadMessages(chat.conversationId);
    if (chat.isRead === false) {
      await markMessageAsRead(chat.conversationId, currentUserId!);
      loadConversations();
    }
  };

  return (
    <div
      className="flex overflow-hidden bg-gray-100"
      style={{ height: "calc(100vh - 68px)" }}
    >
      <ChatList
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedChat={selectedChat}
        onChatSelect={handleChatSelect}
        conversations={conversations}
        loading={loading}
        error={null}
        showBorder
      />

      <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
        {selectedChat ? (
          <>
            <ChatHeader selectedChat={selectedChat} />
            <div className="flex-1 flex flex-col min-h-0 relative bg-gray-50 overflow-hidden">
              <MessageList
                messages={messages}
                messagesEndRef={messagesEndRef}
                currentUserId={currentUserId}
              />
            </div>
            <MessageInput
              newMessage={newMessage}
              setNewMessage={setNewMessage}
              onSendMessage={handleSendMessage}
              selectedFiles={[]}
              setSelectedFiles={() => {}}
              imagePreview={null}
              setImagePreview={() => {}}
              isRecording={false}
              onVoiceRecord={() => {}}
              onFileSelect={() => {}}
              onRemoveFile={() => {}}
              onRemoveImagePreview={() => {}}
              onClearAllFiles={() => {}}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
            <div className="p-6 rounded-full bg-white shadow-sm mb-4">
              <FaCommentDots size={48} className="opacity-20 text-blue-600" />
            </div>
            <p className="font-medium">Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBoxHome;
