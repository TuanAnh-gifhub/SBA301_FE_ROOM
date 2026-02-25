import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaMinus, FaCommentDots, FaArrowLeft } from "react-icons/fa";

import ChatList from "./ChatList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

import {
  getUserConversations,
  getMessages,
} from "../../../services/chats/chatService";

import websocketService from "../../../services/chats/websocketService";
import { useUnreadMessages } from "../../../hooks/useUnreadMessages";
import { useAuth } from "../../../context/AuthContext";

/* ================= TYPES ================= */

// ChatBubble.tsx
interface User {
  userId: string;
  userName: string; // Bỏ dấu '?' để bắt buộc, khớp với UserResponse
  fullName?: string;
  avatar?: string;
}

// Đảm bảo Interface Conversation có đủ các trường như ConversationResponse
interface Conversation {
  conversationId: string;
  conversationTitle: string;
  lastMessage: string;
  lastSenderName: string;
  updatedAt: string;
  sender: User;
  recipient: User;
  isRead: boolean; // Bỏ dấu '?'
  otherPerson?: User;
}

interface Message {
  messageId: string;
  senderId: string;
  conversationId: string;
  sender: "user" | "other";
  content: string;
  createdAt: string;
  isRead: boolean;
}

/* ================= COMPONENT ================= */

const ChatBubble = () => {
  const navigate = useNavigate();
  const { unreadCount } = useUnreadMessages(10000);
  const { user } = useAuth();
  const currentUserId = user?.userId || null;

  /* ---------- UI STATE ---------- */

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showChatList, setShowChatList] = useState(true);

  /* ---------- DATA STATE ---------- */

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  /* ---------- INPUT STATE ---------- */

  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentConversationIdRef = useRef<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  /* ================= LOAD CONVERSATIONS ================= */

  const loadConversations = async () => {
    if (!currentUserId) return;

    setLoading(true);
    const res = await getUserConversations(currentUserId);

    if (res.success && Array.isArray(res.data)) {
      const mapped = res.data.map((c: any) => {
        const other =
          c.sender?.userId === currentUserId ? c.recipient : c.sender;

        return {
          ...c,
          conversationTitle: c.conversationTitle || "Người dùng",
          lastMessage: c.lastMessage || "",
          lastSenderName: c.lastSenderName || "",
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

    const res = await getMessages(id);

    if (res.success && Array.isArray(res.data)) {
      const transformed = res.data.map((msg: any) => ({
        messageId: msg.messageId,
        senderId: msg.senderId,
        conversationId: id,
        sender: (msg.senderId === currentUserId ? "user" : "other") as
          | "user"
          | "other",
        content: msg.content,
        createdAt: msg.createdAt,
        isRead: msg.isRead ?? true,
      }));

      setMessages(transformed);
    }
  };

  /* ================= WEBSOCKET ================= */

  useEffect(() => {
    if (!user?.userId || window.location.pathname === "/chat") return;
    
    loadConversations();

    const unsubscribe = websocketService.onNewMessage((data: any) => {
      console.log("Nhận tin nhắn mới:", data);
      if (currentConversationIdRef.current === data.conversationId) {
        const incoming: Message = {
          messageId: data.messageId,
          senderId: data.senderId,
          conversationId: data.conversationId,
          sender: data.senderId === currentUserId ? "user" : "other",
          content: data.content,
          createdAt: data.createdAt,
          isRead: data.isRead ?? false,
        };

        setMessages((prev) => {
          const filtered = prev.filter(
            (m) =>
              !(
                m.messageId.startsWith("temp-") &&
                m.content === incoming.content
              ),
          );

          if (filtered.find((m) => m.messageId === incoming.messageId)) {
            return filtered;
          }

          return [...filtered, incoming];
        });
      }

      loadConversations();
    });

    return () => {
      unsubscribe();
    };
  }, [user?.userId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // Chạy mỗi khi mảng messages có thêm phần tử mới

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !selectedChat) return;

    const recipientId =
      selectedChat.sender.userId === currentUserId
        ? selectedChat.recipient.userId
        : selectedChat.sender.userId;

    if (!recipientId) {
      console.error("Không tìm thấy ID người nhận");
      return;
    }

    // 1. Tạo đối tượng tin nhắn tạm thời
    const tempMessage: Message = {
      messageId: `temp-${Date.now()}`, // ID tạm để React không trùng key
      senderId: currentUserId,
      conversationId: selectedChat.conversationId || "",
      sender: "user",
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
      isRead: true,
    };

    try {
      if (websocketService.isConnected()) {
        const messagePayload = {
          conversationId: selectedChat.conversationId || null,
          senderId: currentUserId,
          recipientId: recipientId,
          content: newMessage.trim(),
        };

        // 2. Gửi qua socket
        websocketService.send("/app/chat", messagePayload);

        // 3. CẬP NHẬT UI NGAY LẬP TỨC
        setMessages((prev) => [...prev, tempMessage]);
        setNewMessage(""); // Xóa ô input
      } else {
        console.error("Chưa kết nối WebSocket!");
      }
    } catch (err) {
      console.error("Lỗi gửi tin nhắn:", err);
    }
  };

  /* ================= CHAT SELECT ================= */

  const handleChatSelect = async (chat: Conversation) => {
    setSelectedChat(chat);
    setShowChatList(false);
    await loadMessages(chat.conversationId);
  };

  if (window.location.pathname === "/chat") return null;

  /* ================= UI ================= */

  return (
    <>
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center relative"
          >
            <FaCommentDots size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border ${
            isMinimized ? "w-72 h-14" : "w-[340px] h-[520px]"
          }`}
        >
          <div className="px-4 py-3 bg-blue-600 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              {/* NÚT BACK CHỈ HIỆN KHI ĐANG MỞ CHAT CHI TIẾT */}
              {!showChatList && (
                <button
                  onClick={() => setShowChatList(true)}
                  className="hover:bg-blue-700 p-1 rounded-full transition-colors"
                >
                  <FaArrowLeft size={14} />
                </button>
              )}
              <span className="font-semibold truncate max-w-[180px]">
                {showChatList
                  ? "Đoạn chat"
                  : selectedChat?.otherPerson?.userName || "Người dùng"}
              </span>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setIsMinimized(!isMinimized)}>
                <FaMinus size={12} />
              </button>
              <button onClick={() => setIsOpen(false)}>
                <FaTimes size={14} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {showChatList ? (
                <ChatList
                  conversations={conversations}
                  selectedChat={selectedChat}
                  onChatSelect={handleChatSelect}
                  loading={loading}
                  error={null}
                  // Truyền thêm các props này để tránh lỗi undefined.trim()
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              ) : (
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <MessageList
                    messages={messages}
                    messagesEndRef={messagesEndRef}
                    currentUserId={currentUserId}
                  />

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
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBubble;
