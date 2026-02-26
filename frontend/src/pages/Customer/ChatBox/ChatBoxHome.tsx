import { useState, useEffect, useRef } from "react";
import { FaCommentDots } from "react-icons/fa";
import ChatList from "./ChatList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";

import chatService from "../../../services/chats/chatService";
import websocketService from "../../../services/chats/websocketService";
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
  const currentConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= LOAD CONVERSATIONS ================= */
  const loadConversations = async () => {
    if (!currentUserId) return;
    setLoading(true);
    const res = await chatService.getUserConversations(currentUserId);

    if (res.result && Array.isArray(res.result)) {
      const mapped = res.result.map((c: any) => {
        // ĐỒNG BỘ: Xác định otherPerson dựa trên user1/user2 từ backend
        const other = c.user1?.id === currentUserId ? c.user2 : c.user1;
        return {
          ...c,
          name:
            other?.username ||
            "Người dùng",
          otherPerson: other,
        };
      });
      setConversations(mapped);
    }
    setLoading(false);
  };

  /* ================= LOAD MESSAGES ================= */
  const loadMessages = async (id: string) => {
    currentConversationIdRef.current = id;
    const res = await chatService.getMessages(id);

    if (res.result && Array.isArray(res.result)) {
      const transformed = res.result.map((msg: any) => ({
        ...msg,
        // ĐỒNG BỘ: Xác định phe gửi (user/other)
        sender: msg.senderId === currentUserId ? "user" : "other",
        isRead: msg.isRead ?? true, // Tránh lỗi gạch đỏ ở MessageList
      }));
      setMessages(transformed);
    }
  };

  /* ================= WEBSOCKET ================= */
  useEffect(() => {
    if (!currentUserId) return;

    loadConversations();

    const unsubscribe = websocketService.onNewMessage((data: any) => {
      // Chỉ cập nhật nếu tin nhắn thuộc hội thoại đang mở
      if (
        String(currentConversationIdRef.current) === String(data.conversationId)
      ) {
        setMessages((prev) => {
          // Lọc trùng ID và tin nhắn tạm
          const filtered = prev.filter(
            (m) =>
              m.messageId !== data.messageId &&
              !(m.messageId.startsWith("temp-") && m.content === data.content),
          );

          const isMe = data.senderId === currentUserId;

          return [
            ...filtered,
            {
              ...data,
              sender: isMe ? "user" : "other",
              isRead: data.isRead ?? false,
            },
          ];
        });
      }
      // Làm mới danh sách hội thoại để cập nhật tin nhắn cuối (lastMessage)
      loadConversations();
    });

    return () => unsubscribe();
  }, [currentUserId, isAuthenticated]);

  /* ================= SEND MESSAGE ================= */
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !currentUserId) return;
    console.log("selectedChat id la: ", selectedChat.user1)
    const recipientId =
      selectedChat.user1?.userId === currentUserId
        ? selectedChat.user2?.userId
        : selectedChat.user1?.userId;

    if (!recipientId) {
      console.log(recipientId)
      console.error("Không tìm thấy recipientId!");
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

    // Update UI ngay lập tức
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

  /* ================= CHAT SELECT ================= */
  const handleChatSelect = async (chat: any) => {
    setSelectedChat(chat);
    currentConversationIdRef.current = chat.conversationId;

    await loadMessages(chat.conversationId);

    // ĐỒNG BỘ: Logic mark as read
    if (chat.isRead === false) {
      await chatService.markMessageAsRead(chat.conversationId, currentUserId!);
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
