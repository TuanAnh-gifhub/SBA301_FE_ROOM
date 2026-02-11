import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaMinus, FaCommentDots } from "react-icons/fa";
import ChatList from "./ChatList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import {
  getUserConversations,
  getMessages,
  sendMessage,
  getConversation,
  markMessageAsRead,
} from "../../../services/chats/chatService";

import websocketService from "../../../services/chats/websocketService";
import { tokenService } from "../../../services/auth/tokenService";
import { useUnreadMessages } from "../../../hooks/useUnreadMessages";

// ============ TYPE DEFINITIONS (Đã đồng bộ với component con) ============

interface User {
  userId: string;
  fullName?: string;
  userName?: string;
  avatar?: string;
}

// Interface này phải khớp với ConversationResponse trong ChatList.tsx
interface Conversation {
  conversationId: string;
  conversationTitle: string; // Đã sửa: bắt buộc
  lastMessage: string;
  lastSenderName: string; // Đã thêm: bắt buộc để khớp ChatList
  updatedAt: string;
  sender: User;
  recipient: User;
  isRead?: boolean;

  // Các trường UI bổ sung (Optional)
  otherPerson?: User;
  name?: string;
  avatar?: string;
  time?: string;
  isOnline?: boolean;
  lastActive?: string;
  type?: string;
  listing?: any;
}

// Interface này phải khớp với Message trong MessageList.tsx
interface Message {
  messageId: string; // Đã đổi từ id -> messageId
  senderId: string;
  conversationId: string; // Đã thêm: bắt buộc
  sender: "user" | "other";
  content: string;
  createdAt: string;
  isRead: boolean; // Đã sửa: bắt buộc
  time?: string;
}

interface FileItem {
  file: File;
  dataURL?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
}

const ChatBubble = () => {
  const navigate = useNavigate();
  const [isDarkMode] = useState(
    () => localStorage.getItem("landing_dark_mode") === "true",
  );

  const getCurrentUserId = (): string | null => {
    try {
      const userInfo = localStorage.getItem("userInfo");
      return userInfo ? JSON.parse(userInfo).userId : null;
    } catch {
      return null;
    }
  };

  const [currentUserId] = useState<string | null>(getCurrentUserId());
  const { unreadCount } = useUnreadMessages(10000);

  // --- STATE QUẢN LÝ UI ---
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showChatList, setShowChatList] = useState(true);

  // --- STATE BỊ THIẾU TRƯỚC ĐÓ (Đã thêm để fix lỗi) ---
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  // --- STATE DỮ LIỆU ---
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // --- INPUT & FILE STATE ---
  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  const [position, setPosition] = useState({
    x: window.innerWidth - 80,
    y: window.innerHeight - 80,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentConversationIdRef = useRef<string | null>(null);

  // Đã sửa: Khởi tạo ref đúng kiểu để truyền vào ChatList
  const settingsMenuRef = useRef<HTMLDivElement>(null);

  const isDragging = useRef(false);
  const hasDragged = useRef(false);

  // Load conversations
  const loadConversations = async () => {
    if (!currentUserId) return;
    setLoading(true);
    const res = (await getUserConversations(currentUserId)) as ApiResponse<
      Conversation[]
    >;
    if (res.success) {
      // Map dữ liệu nếu API trả về thiếu trường lastSenderName
      const mappedData = (res.data || []).map((c) => ({
        ...c,
        lastSenderName: c.lastSenderName || "", // Fallback để tránh lỗi undefined
        conversationTitle: c.conversationTitle || "",
      }));
      setConversations(mappedData);
    }
    setLoading(false);
  };

  // Load messages
  const loadMessages = async (id: string) => {
    currentConversationIdRef.current = id;
    const res = (await getMessages(id)) as ApiResponse<any[]>;
    if (res.success && res.data) {
      const transformed = res.data.map((msg) => ({
        messageId: msg.messageId,
        sender: msg.senderId === currentUserId ? "user" : "other",
        content: msg.content,
        createdAt: msg.createdAt,
        senderId: msg.senderId,
        conversationId: id, // Đảm bảo có trường này
        isRead: msg.isRead !== undefined ? msg.isRead : true,
        time: new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
      setMessages(transformed as Message[]);

      const hasUnread = transformed.some(
        (m) => m.sender === "other" && !m.isRead,
      );
      if (hasUnread) await markMessageAsRead(id, currentUserId!);
    }
  };

  // WebSocket Connection
  useEffect(() => {
    if (currentUserId) {
      loadConversations();
      const wsUrl =
        import.meta.env.VITE_WS_URL ||
        "http://localhost:8080/api/v1/rent-room/ws";
      const token = tokenService.getAccessToken();

      if (!websocketService.isConnected()) {
        websocketService.connect(wsUrl, token);
      }

      websocketService.onNewMessage((data: any) => {
        if (currentConversationIdRef.current === data.conversationId) {
          const incoming: Message = {
            messageId: data.messageId,
            content: data.content,
            sender: data.senderId === currentUserId ? "user" : "other",
            senderId: data.senderId,
            conversationId: data.conversationId, // Bắt buộc
            createdAt: data.createdAt,
            isRead: data.isRead !== undefined ? data.isRead : false,
          };
          setMessages((prev) =>
            prev.find((m) => m.messageId === incoming.messageId)
              ? prev
              : [...prev, incoming],
          );
        }

        setConversations((prev) =>
          prev.map((c) =>
            c.conversationId === data.conversationId
              ? { ...c, lastMessage: data.content, updatedAt: data.createdAt }
              : c,
          ),
        );
      });
    }
  }, [currentUserId]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedChat) {
      const recipientId =
        selectedChat.otherPerson?.userId ||
        (selectedChat.sender.userId === currentUserId
          ? selectedChat.recipient.userId
          : selectedChat.sender.userId);

      if (!recipientId) return;

      const payload = {
        senderId: currentUserId,
        recipientId: recipientId,
        content: newMessage.trim(),
        conversationId: selectedChat.conversationId,
      };

      if (websocketService.isConnected()) {
        websocketService.send("/app/chat", payload);
        setNewMessage("");
      } else {
        const res = await sendMessage(
          selectedChat.conversationId,
          currentUserId!,
          recipientId,
          newMessage.trim(),
        );
        if (res.success) setNewMessage("");
      }
    }
  };

  const handleChatSelect = async (chat: any) => {
    // ChatList trả về object kiểu Chat (đã extend Conversation), nên có đủ dữ liệu
    const id = chat.conversationId;

    // Tìm hoặc dùng luôn object chat được click
    const targetChat =
      conversations.find((c) => c.conversationId === id) || chat;

    setSelectedChat(targetChat);
    setShowChatList(false);
    await loadMessages(id);

    // Nếu chưa có otherPerson (do load từ list API thuần), ta tự tính toán
    if (!targetChat.otherPerson) {
      // Logic xác định đối phương
      const other =
        targetChat.sender.userId === currentUserId
          ? targetChat.recipient
          : targetChat.sender;
      setSelectedChat((prev) =>
        prev ? { ...prev, otherPerson: other, name: other.userName } : null,
      );
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    hasDragged.current = false;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      hasDragged.current = true;
      setPosition({ x: e.clientX - 28, y: e.clientY - 28 });
    };
    const handleMouseUp = () => (isDragging.current = false);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  if (window.location.pathname === "/chat") return null;

  return (
    <>
      {!isOpen && currentUserId && (
        <div
          className="fixed z-50 cursor-grab active:cursor-grabbing"
          style={{ left: position.x, top: position.y }}
          onMouseDown={handleMouseDown}
        >
          <button
            onClick={() => !hasDragged.current && setIsOpen(true)}
            className="w-14 h-14 bg-[#4da6ff] text-white rounded-full shadow-lg flex items-center justify-center relative hover:scale-110 transition-transform"
          >
            <FaCommentDots size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {isOpen && (
        <div
          className={`fixed bottom-4 right-4 z-50 rounded-lg shadow-2xl flex flex-col transition-all ${
            isDarkMode
              ? "bg-gray-900 border-gray-700"
              : "bg-white border-gray-200"
          } border ${isMinimized ? "w-72 h-14" : "w-96 h-[550px]"}`}
        >
          <div
            className={`p-3 border-b flex items-center justify-between ${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}
          >
            <div className="flex items-center gap-2">
              {!showChatList && (
                <button
                  onClick={() => {
                    setShowChatList(true);
                    setSelectedChat(null);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M15 19l-7-7 7-7" strokeWidth="2" />
                  </svg>
                </button>
              )}
              <span className="font-bold text-sm">
                {showChatList
                  ? "Đoạn chat"
                  : selectedChat?.otherPerson?.userName ||
                    selectedChat?.name ||
                    "Chat"}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <FaMinus size={12} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-red-100 text-red-500 rounded"
              >
                <FaTimes size={14} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {showChatList ? (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <ChatList
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    selectedChat={selectedChat}
                    onChatSelect={handleChatSelect}
                    showSettingsMenu={showSettingsMenu}
                    setShowSettingsMenu={setShowSettingsMenu}
                    settingsMenuRef={settingsMenuRef} // ĐÃ FIX: Truyền ref thật
                    conversations={conversations}
                    loading={loading}
                    error={null}
                    isFullWidth
                    isDarkMode={isDarkMode}
                  />
                  <button
                    onClick={() => {
                      navigate("/chat");
                      setIsOpen(false);
                    }}
                    className="p-3 text-center text-[#4da6ff] text-sm font-medium border-t hover:bg-gray-50"
                  >
                    Mở trong trang Chat toàn màn hình
                  </button>
                </div>
              ) : (
                <>
                  <MessageList
                    messages={messages}
                    messagesEndRef={messagesEndRef}
                    isDarkMode={isDarkMode}
                  />
                  <MessageInput
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    onSendMessage={handleSendMessage}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                    imagePreview={imagePreview}
                    setImagePreview={setImagePreview}
                    isRecording={isRecording}
                    onVoiceRecord={() => setIsRecording(!isRecording)}
                    onFileSelect={() => {}}
                    onRemoveFile={() => {}}
                    onRemoveImagePreview={() => {}}
                    onClearAllFiles={() => {}}
                    isDarkMode={isDarkMode}
                  />
                </>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBubble;
